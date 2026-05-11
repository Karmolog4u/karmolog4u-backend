import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meditation } from './schemas/meditation.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class MeditationService {
  constructor(
    @InjectModel(Meditation.name) private meditationModel: Model<Meditation>,
  ) {}

  async findPrevueMeditation() {
    const meditation = await this.meditationModel
      .aggregate([
        {
          $match: {
            toDelete: false,
            status: 'PUBLISHED', // Виключаємо документи, де toDelete = false
          },
        },
        {
          $lookup: {
            from: 'discounts',
            let: { now: new Date() },
            localField: '_id',
            foreignField: 'refId',
            as: 'discount',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $lte: ['$start', '$$now'] }],
                  },
                },
              },
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
            _id: 0,
            id: '$_id',
            category: 1,
            name: 1,
            price: 1,
            cover: 1,
            isWaiting: 1,
            discount: {
              $cond: {
                if: { $ne: ['$discount', null] }, // Якщо discount не дорівнює null
                then: '$discount', // Залишити поле
                else: '$$REMOVE', // Виключити поле з результату
              },
            },
            video: {
              $cond: {
                if: { $eq: ['$category', 'ARCANES'] },
                then: '$video',
                else: '$$REMOVE',
              },
            },
          },
        },
      ])
      .exec();
    if (meditation.length == 0) {
      throw new NotFoundException('Meditations not found');
    }
    return meditation;
  }

  async findMeditationById(meditationId: string) {
    const meditation = await this.meditationModel
      .aggregate([
        {
          $match: {
            _id: new Types.ObjectId(meditationId),
            status: 'PUBLISHED',
            toDelete: false,
          },
        },
        {
          $lookup: {
            from: 'discounts',
            let: {
              meditationId: '$_id',
              now: new Date(),
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$refId', '$$meditationId'] },
                      { $lte: ['$start', '$$now'] },
                      { $gte: ['$expiredAt', '$$now'] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  start: 1,
                  expiredAt: 1,
                  discount: 1,
                },
              },
              { $limit: 1 },
            ],
            as: 'discount',
          },
        },
        {
          $addFields: {
            discount: {
              $cond: {
                if: { $gt: [{ $size: '$discount' }, 0] },
                then: { $arrayElemAt: ['$discount', 0] },
                else: '$$REMOVE',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            category: 1,
            name: 1,
            price: 1,
            cover: 1,
            isWaiting: 1,
            video: {
              $cond: {
                if: { $eq: ['$category', 'OPENED'] },
                then: '$video',
                else: '$$REMOVE',
              },
            },
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

    return meditation[0];
  }
}
