import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeditationEntity } from 'src/products/meditations/dto/meditation-entity.dto';
import { Meditation } from 'src/products/meditations/schemas/meditation.schema';
import { ResponseSuccessDto } from 'src/products/meditations/dto/response-success.dto';
import { ChangeStatusMeditationDto } from './dto/change-status-meditation.dto';
import { MeditationIdDto } from 'src/products/meditations/dto/meditation-id.dto';
import { Discount } from '../discount/schemas/discount.schema';

@Injectable()
export class AdminMeditationService {
  constructor(
    @InjectModel(Meditation.name) private meditationModel: Model<Meditation>,
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
  ) {}

  async getMeditationCount(): Promise<number> {
    try {
      return await this.meditationModel.countDocuments({
        toDelete: false,
      });
    } catch (error) {
      throw new NotFoundException('Медитацій не знайдено');
    }
  }

  async findAllMeditation(): Promise<MeditationEntity[]> {
    try {
      return await this.meditationModel
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
      throw new NotFoundException('Медитацій не знайдено');
    }
  }

  async findMeditationById(
    meditationId: MeditationIdDto,
  ): Promise<MeditationEntity> {
    try {
      const response = await this.meditationModel
        .aggregate([
          {
            $match: { _id: meditationId }, // Знаходимо користувача за _id
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
      throw new NotFoundException(`Медитацію ${meditationId} не знайдено`);
    }
  }

  async createMeditation(meditationData: any): Promise<MeditationEntity> {
    try {
      const newMeditation = new this.meditationModel(meditationData);
      await newMeditation.save();
      return newMeditation;
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async editMeditation(
    meditationData: any,
    meditationId: MeditationIdDto,
  ): Promise<MeditationEntity> {
    try {
      return await this.meditationModel
        .findOneAndUpdate({ _id: meditationId }, meditationData, {
          new: true,
          projection: { __v: 0, createdAt: 0, updatedAt: 0 },
        })
        .lean()
        .exec();
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async deleteMeditation(
    meditationId: MeditationIdDto,
  ): Promise<ResponseSuccessDto> {
    try {
      await this.meditationModel.updateOne({ _id: meditationId }, [
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

  async changeStatusMeditation(
    meditationId: MeditationIdDto,
    status: ChangeStatusMeditationDto,
  ): Promise<ResponseSuccessDto> {
    try {
      await this.meditationModel.findOneAndUpdate(
        { _id: meditationId },
        { $set: { ...status } },
        { new: true },
      );
      return { message: 'Успішно' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async getMeditationList() {
    try {
      return await this.meditationModel.aggregate([
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
              $literal: 'Meditation',
            },
            _id: 0,
          },
        },
      ]);
    } catch (error) {
      throw new InternalServerErrorException(
        'Не вдалося отримати список медитацій',
      );
    }
  }
}
