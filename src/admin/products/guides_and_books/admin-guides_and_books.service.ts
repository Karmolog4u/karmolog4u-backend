import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discount } from '../discount/schemas/discount.schema';
import { IdDto } from 'src/common/dto/id.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { GuidesAndBooks } from './schemas/guides_and_books.schema';
import { GuidesAndBooksEntity } from './dto/guides_and_books-entity.dto';
import { ChangeStatusGuidesAndBooksDto } from './dto/change-status-guides_and_books.dto';

@Injectable()
export class AdminGuidesAndBooksService {
  constructor(
    @InjectModel(GuidesAndBooks.name)
    private guidesAndBooksModel: Model<GuidesAndBooks>,
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
            $match: { _id: guidesAndBooksId }, // Знаходимо користувача за _id
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
              description: 1,
              video: 1,
              cover: 1,
              price: 1,
              isWaiting: 1,
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
      const newGuidesAndBooks = new this.guidesAndBooksModel(
        guidesAndBooksData,
      );
      await newGuidesAndBooks.save();
      return newGuidesAndBooks;
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async editGuidesAndBooks(
    guidesAndBooksData: any,
    guidesAndBooksId: IdDto,
  ): Promise<GuidesAndBooksEntity> {
    try {
      return await this.guidesAndBooksModel
        .findOneAndUpdate({ _id: guidesAndBooksId }, guidesAndBooksData, {
          new: true,
          projection: { __v: 0, createdAt: 0, updatedAt: 0 },
        })
        .lean()
        .exec();
    } catch (error) {
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
