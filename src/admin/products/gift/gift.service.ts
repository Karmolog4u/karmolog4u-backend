import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Gift } from './schemas/gift.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IdDto } from 'src/common/dto/id.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';

@Injectable()
export class GiftService {
  constructor(@InjectModel(Gift.name) private giftModel: Model<Gift>) {}
  async getGiftsCount(): Promise<number> {
    try {
      return await this.giftModel.countDocuments({
        toDelete: false,
      });
    } catch (error) {
      throw new NotFoundException('Гайди не знайдено');
    }
  }
  async findAllGifts() {
    try {
      return await this.giftModel
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

  async findGiftById(id: IdDto) {
    try {
      const response = await this.giftModel
        .aggregate([
          {
            $match: { _id: id._id }, // Знаходимо користувача за _id
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
              status: 1,
              name: 1,
              description: 1,
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
      throw new NotFoundException(`Гайди ${id._id} не знайдено`);
    }
  }

  async createGift(data: any) {
    try {
      const newGift = new this.giftModel(data);
      await newGift.save();
      return newGift;
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async editGift(data: any, id: IdDto) {
    try {
      return await this.giftModel
        .findOneAndUpdate({ _id: id._id }, data, {
          new: true,
          projection: { __v: 0, createdAt: 0, updatedAt: 0 },
        })
        .lean()
        .exec();
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async deleteGift(id: IdDto): Promise<ResponseSuccessDto> {
    try {
      await this.giftModel.updateOne({ _id: id._id }, [
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
  async changeStatusGift(id: IdDto, status: any): Promise<ResponseSuccessDto> {
    try {
      await this.giftModel.findOneAndUpdate(
        { _id: id._id },
        { $set: { ...status } },
        { new: true },
      );
      return { message: 'Успішно' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }
}
