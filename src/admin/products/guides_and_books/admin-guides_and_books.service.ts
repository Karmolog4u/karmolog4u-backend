import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Discount } from '../discount/schemas/discount.schema';
import { IdDto } from 'src/common/dto/id.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { GuidesAndBooks } from './schemas/guides_and_books.schema';
import { GuidesAndBooksEntity } from './dto/guides_and_books-entity.dto';
import { ChangeStatusGuidesAndBooksDto } from './dto/change-status-guides_and_books.dto';
import { StorageService } from 'src/storage/storage.service';
import { attachTargetToFiles } from 'src/common/helper/attachTargetToFiles';
import { FilesService } from 'src/files/files.service';
import { getDifference } from 'src/common/helper/getDifferenceArray';

@Injectable()
export class AdminGuidesAndBooksService {
  constructor(
    @InjectModel(GuidesAndBooks.name)
    private guidesAndBooksModel: Model<GuidesAndBooks>,
    private readonly storageService: StorageService,
    private readonly filesService: FilesService,
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
  ) {}

  async getGuidesAndBooksCount(): Promise<number> {
    try {
      return await this.guidesAndBooksModel.countDocuments({
        toDelete: false,
      });
    } catch (error) {
      throw new NotFoundException('Гайди не знайдено');
    }
  }

  async findAllGuidesAndBooks(): Promise<GuidesAndBooksEntity[]> {
    try {
      return await this.guidesAndBooksModel
        .aggregate([
          {
            $match: {
              toDelete: false, // Виключаємо документи, де toDelete = false
            },
          },
          {
            $lookup: {
              from: 'discounts', // Назва другої колекції
              localField: '_id', // Поле в першій колекції
              foreignField: 'refId', // Поле у другій колекції
              as: 'discount', // Ім'я поля для результату
              pipeline: [
                {
                  $project: {
                    // Вибір конкретних полів
                    _id: 0, // Виключити _id
                    start: 1, // Залишити поле product
                    expiredAt: 1, // Залишити поле price
                    discount: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              discount: {
                $cond: {
                  if: { $gt: [{ $size: '$discount' }, 0] }, // Якщо масив не порожній
                  then: { $arrayElemAt: ['$discount', 0] },
                  else: null,
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              category: 1,
              status: 1,
              name: 1,
              discount: {
                $cond: {
                  if: { $ne: ['$discount', null] }, // Якщо discount не дорівнює null
                  then: '$discount', // Залишити поле
                  else: '$$REMOVE', // Виключити поле з результату
                },
              },
            },
          },
        ])
        .exec();
    } catch (error) {
      throw new NotFoundException('Гайди не знайдено');
    }
  }

  async findGuidesAndBooksById(
    guidesAndBooksId: IdDto,
  ): Promise<GuidesAndBooksEntity> {
    try {
      const response = await this.guidesAndBooksModel
        .aggregate([
          {
            $match: { _id: guidesAndBooksId },
          },
          // 🔹 lookup для знижки
          {
            $lookup: {
              from: 'discounts',
              localField: '_id',
              foreignField: 'refId',
              as: 'discount',
              pipeline: [
                {
                  $project: {
                    _id: 0,
                    start: 1,
                    expiredAt: 1,
                    discount: 1,
                  },
                },
              ],
            },
          },
          // 🔹 lookup для файлу
          {
            $lookup: {
              from: 'files',
              localField: 'file',
              foreignField: '_id',
              as: 'fileData',
              pipeline: [
                {
                  $project: {
                    _id: 0,
                    savedName: 1,
                    originalName: 1,
                  },
                },
              ],
            },
          },
          // 🔹 формуємо поля
          {
            $addFields: {
              discount: {
                $cond: {
                  if: { $gt: [{ $size: '$discount' }, 0] },
                  then: { $arrayElemAt: ['$discount', 0] },
                  else: null,
                },
              },
              file: {
                $cond: {
                  if: { $gt: [{ $size: '$fileData' }, 0] },
                  then: { $arrayElemAt: ['$fileData', 0] }, // { savedName, originalName }
                  else: null,
                },
              },
            },
          },
          // 🔹 фінальний проєкт
          {
            $project: {
              _id: 1,
              category: 1,
              status: 1,
              name: 1,
              description: 1,
              video: 1,
              cover: 1,
              price: 1,
              isWaiting: 1,
              file: 1, // { savedName, originalName }
              discount: {
                $cond: {
                  if: { $ne: ['$discount', null] },
                  then: '$discount',
                  else: '$$REMOVE',
                },
              },
            },
          },
        ])
        .exec();

      if (!response[0]) {
        throw new Error();
      }
      return response[0];
    } catch (error) {
      throw new NotFoundException(`Гайди ${guidesAndBooksId} не знайдено`);
    }
  }

  async createGuidesAndBooks(
    guidesAndBooksData: any,
  ): Promise<GuidesAndBooksEntity> {
    try {
      const { file, ...guides } = guidesAndBooksData;
      const newGuidesAndBooks = new this.guidesAndBooksModel(guides);
      await newGuidesAndBooks.save();
      if (!newGuidesAndBooks) {
        throw new Error('Помилка створення гайду');
      }

      const folderPath = await this.storageService.createProductStorage(
        newGuidesAndBooks._id.toString(),
      );

      const updateData: Record<string, any> = {};

      if (file) {
        console.log(file, 'file');

        //check exist
        const existingFiles = await this.storageService.filterExistingFiles([
          file,
        ]);
        console.log(existingFiles, 'ex');

        if (existingFiles.length > 0) {
          const files = await this.storageService.copyFiles(
            folderPath,
            existingFiles,
          );
          console.log(files, 'fil');

          //delete from temporary folder
          await this.storageService.deleteFiles(process.cwd(), existingFiles);
          console.log('delete');

          //add to array lesson id
          const filesToSave = attachTargetToFiles(
            files,
            'GuidesAndBooks',
            newGuidesAndBooks._id,
          );
          console.log(filesToSave, 'filetosave');

          //create file documents
          const savedFiles = await this.filesService.createFiles(filesToSave);
          console.log(savedFiles, 'saved');

          //get ids to save in db lesson
          const ids = savedFiles.map((item) => item._id.toString());
          console.log(ids, 'ids');

          //save to lesson
          updateData.file = ids[0];
        }
      }

      await this.guidesAndBooksModel.updateOne(
        { _id: newGuidesAndBooks._id },
        {
          $set: { ...updateData },
        },
      );

      return newGuidesAndBooks;
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async editGuidesAndBooks(
    guidesAndBooksData: any,
    guidesAndBooksId: IdDto,
  ): Promise<any> {
    try {
      const { file, ...guides } = guidesAndBooksData;

      const oldGuide = await this.guidesAndBooksModel
        .findById(guidesAndBooksId)
        .lean();
      if (!oldGuide) {
        throw new NotFoundException('Гайд не знайдено :(');
      }

      const updateData: Record<string, any> = {
        file: Types.ObjectId,
      }; // Store all updates

      await this.guidesAndBooksModel.findByIdAndUpdate(
        guidesAndBooksId,
        guides,
        {
          new: true, // Return the updated document
          runValidators: true, // Run validation checks
        },
      );

      const oldFiles = await this.filesService.getFilesByIds([oldGuide.file]);

      const differenceFiles = getDifference(oldFiles, [file]);

      // if (differenceHomeworkFiles.inBoth.length != 0) {
      //   const oldFilesIds = differenceHomeworkFiles.inBoth.map((item) =>
      //     item._id.toString(),
      //   );
      //   //save to lesson
      //   updateData.homeworkFiles = [...oldFilesIds];
      // }

      if (differenceFiles.onlyInArr1.length != 0) {
        //delete from storage
        await this.storageService.deleteFiles(
          this.storageService.getStoragePath(),
          differenceFiles.onlyInArr1,
        );
        //delete from db
        const fileIds = differenceFiles.onlyInArr1.map((i) => i._id);

        //remove from db
        await this.filesService.deleteFiles(fileIds);
      }

      //add files to lesson folder if exist
      if (differenceFiles.onlyInArr2.length != 0) {
        const existingFiles = await this.storageService.filterExistingFiles(
          differenceFiles.onlyInArr2,
        );

        //if file exist -> copy to lesson folder
        if (existingFiles.length > 0) {
          const newFiles = await this.storageService.copyFiles(
            this.storageService.getProductFilePath(
              guidesAndBooksId.toHexString(),
            ),
            existingFiles,
          );

          //add additional fields to files object
          const filesToSave = attachTargetToFiles(
            newFiles,
            'GuidesAndBooks',
            guidesAndBooksId,
          );
          //save files data to db
          const savedFiles = await this.filesService.createFiles(filesToSave);
          const newFileIds = savedFiles.map((item) => item._id.toString());
          //save to lesson
          updateData.file = newFileIds[0];

          //delete files from temp folder
          await this.storageService.deleteFiles(process.cwd(), existingFiles);
        }
      }
      await this.guidesAndBooksModel.updateOne(
        { _id: guidesAndBooksId },
        {
          $set: { ...updateData },
        },
      );

      return { message: 'success' };
    } catch (error) {
      console.log(error);

      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async deleteGuidesAndBooks(
    guidesAndBooksId: IdDto,
  ): Promise<ResponseSuccessDto> {
    try {
      await this.guidesAndBooksModel.updateOne({ _id: guidesAndBooksId }, [
        {
          $set: {
            toDelete: { $not: ['$toDelete'] },
            expiredAt: {
              $cond: {
                if: { $eq: ['$toDelete', false] },
                then: new Date(new Date().setDate(new Date().getDate() + 30)),
                else: null,
              },
            },
          },
        },
      ]);
      return { message: 'Успішно' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async changeStatusGuidesAndBooks(
    guidesAndBooksId: IdDto,
    status: ChangeStatusGuidesAndBooksDto,
  ): Promise<ResponseSuccessDto> {
    try {
      await this.guidesAndBooksModel.findOneAndUpdate(
        { _id: guidesAndBooksId },
        { $set: { ...status } },
        { new: true },
      );
      return { message: 'Успішно' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async getGuidesAndBooksList() {
    try {
      return this.guidesAndBooksModel.aggregate([
        {
          $match: {
            toDelete: false,
            status: 'PUBLISHED',
          },
        },
        {
          $project: {
            id: '$_id',
            name: '$name.uk',
            targetModule: {
              $literal: 'GuidesAndBooks',
            },
            _id: 0,
          },
        },
      ]);
    } catch (error) {
      throw new InternalServerErrorException(
        'Не вдалося отримати список гайдів та книг',
      );
    }
  }
}
