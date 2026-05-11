import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gift } from 'src/admin/products/gift/schemas/gift.schema';
import { Model, Types } from 'mongoose';
import { GiftEntity } from 'src/admin/products/gift/dto/gift-entity.dto';

@Injectable()
export class GiftService {
  constructor(@InjectModel(Gift.name) private giftModel: Model<Gift>) {}

  /**
   * Get preview list of gifts for public API
   */
  async findPrevueGifts() {
    const gifts = await this.giftModel
      .aggregate([
        {
          $match: {
            toDelete: false,
            status: 'PUBLISHED',
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
                  $expr: { $lte: ['$start', '$$now'] },
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
            ],
          },
        },
        {
          $addFields: {
            discount: {
              $cond: {
                if: { $gt: [{ $size: '$discount' }, 0] },
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
            name: 1,
            cover: 1,
            price: 1,
            isWaiting: 1,
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

    if (gifts.length === 0) {
      throw new NotFoundException('Gifts not found');
    }
    return gifts;
  }

  async findGiftById(id: string): Promise<GiftEntity> {
    const gift = await this.giftModel
      .aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
            toDelete: false,
            status: 'PUBLISHED',
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
                $match: { $expr: { $lte: ['$start', '$$now'] } },
              },
              {
                $project: { _id: 0, start: 1, expiredAt: 1, discount: 1 },
              },
            ],
          },
        },
        {
          $addFields: {
            discount: {
              $cond: {
                if: { $gt: [{ $size: '$discount' }, 0] },
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
            name: 1,
            description: 1,
            cover: 1,
            price: 1,
            isWaiting: 1,
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

    return gift[0];
  }
}
