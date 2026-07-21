import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GuidesAndBooks } from 'src/admin/products/guides_and_books/schemas/guides_and_books.schema';

@Injectable()
export class GuidesAndBooksService {
  constructor(
    @InjectModel(GuidesAndBooks.name)
    private guidesAndBooksModel: Model<GuidesAndBooks>,
  ) {}

  async findPrevueGuidesAndBooks() {
    const guidesAndBooks = await this.guidesAndBooksModel
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
                  $expr: {
                    $and: [{ $lte: ['$start', '$$now'] }],
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
            category: 1,
            name: 1,
            price: 1,
            cover: 1,
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
    if (guidesAndBooks.length == 0) {
      return [];
    }
    return guidesAndBooks;
  }

  async findGuidesAndBooksById(id: string) {
    const guidesAndBooks = await this.guidesAndBooksModel
      .aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
            status: 'PUBLISHED',
            toDelete: false,
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
            category: 1,
            description: 1,
            name: 1,
            price: 1,
            cover: 1,
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

    return guidesAndBooks[0];
  }
}
