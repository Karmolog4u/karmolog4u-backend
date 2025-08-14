import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Webinar } from './schemas/webinars.schema';
import { Model } from 'mongoose';
import { Discount } from '../discount/schemas/discount.schema';
import { WebinarEntity } from './dto/webinar-entity.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { ChangeStatusWebinarDto } from './dto/change-status.dto';

@Injectable()
export class AdminWebinarsService {
  constructor(
    @InjectModel(Webinar.name) private webinarModel: Model<Webinar>,
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
  ) {}

  async getWebinarCount(): Promise<number> {
    try {
      return await this.webinarModel.countDocuments({
        toDelete: false,
      });
    } catch (error) {
      throw new NotFoundException('Вебінари не знайдено');
    }
  }

  async findAllWebinar(): Promise<WebinarEntity[]> {
    try {
      return await this.webinarModel
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
      throw new NotFoundException('Вебінари не знайдено');
    }
  }

  async findWebinarById(webinarId: IdDto): Promise<WebinarEntity> {
    try {
      const response = await this.webinarModel
        .aggregate([
          {
            $match: { _id: webinarId }, // Знаходимо користувача за _id
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
      throw new NotFoundException(`Вебінар ${webinarId} не знайдено`);
    }
  }

  async createWebinar(webinarData: any): Promise<WebinarEntity> {
    try {
      const newWebinar = new this.webinarModel(webinarData);
      await newWebinar.save();
      return newWebinar;
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async editWebinar(
    webinarData: any,
    webinarId: IdDto,
  ): Promise<WebinarEntity> {
    try {
      return await this.webinarModel
        .findOneAndUpdate({ _id: webinarId }, webinarData, {
          new: true,
          projection: { __v: 0, createdAt: 0, updatedAt: 0 },
        })
        .lean()
        .exec();
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async deleteWebinar(webinarId: IdDto): Promise<ResponseSuccessDto> {
    try {
      await this.webinarModel.updateOne({ _id: webinarId }, [
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

  async changeStatusWebinar(
    webinarId: IdDto,
    status: ChangeStatusWebinarDto,
  ): Promise<ResponseSuccessDto> {
    try {
      await this.webinarModel.findOneAndUpdate(
        { _id: webinarId },
        { $set: { ...status } },
        { new: true },
      );
      return { message: 'Успішно' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }
  async getWebinarList() {
    try {
      return await this.webinarModel.aggregate([
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
        'Не вдалося отримати список вебінарів',
      );
    }
  }
}
