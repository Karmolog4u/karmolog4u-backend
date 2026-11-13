import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discount } from 'src/admin/products/discount/schemas/discount.schema';
import { WebinarEntity } from 'src/admin/products/webinars/dto/webinar-entity.dto';
import {
  CategoryWebinar,
  Status,
  Webinar,
} from 'src/admin/products/webinars/schemas/webinars.schema';
import { IdDto } from 'src/common/dto/id.dto';

@Injectable()
export class WebinarService {
  constructor(
    @InjectModel(Webinar.name) private webinarModel: Model<Webinar>,
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
  ) {}

  async findPrevueWebinar() {
    const response = await this.webinarModel
      .aggregate([
        // Фільтрація записів
        {
          $match: {
            toDelete: false,
            status: Status.PUBLISHED,
          },
        },
        // Перевірка поля category і виконання відповідної логіки
        {
          $facet: {
            webinars: [
              {
                $match: {
                  category: {
                    $in: [CategoryWebinar.WEBINARS, CategoryWebinar.TRAINING],
                  },
                },
              },
              {
                $lookup: {
                  from: 'discounts', // Колекція знижок
                  let: { now: new Date() },
                  localField: '_id', // Поле, яке зв'язує запис
                  foreignField: 'refId', // Поле у колекції discounts
                  as: 'discount', // Результат у полі discount
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
                  updatedAt: 1,
                  category: 1,
                  status: 1,
                  name: 1,
                  cover: 1,
                  price: 1,
                  discount: {
                    $cond: {
                      if: { $ne: ['$discount', null] }, // Якщо discount не дорівнює null
                      then: '$discount', // Залишити поле
                      else: '$$REMOVE', // Виключити поле з результату
                    },
                  },
                },
              },
            ],
            ethers: [
              { $match: { category: CategoryWebinar.ETHERS } },
              {
                $project: {
                  category: 1,
                  name: 1,
                  video: 1,
                  _id: 0,
                  id: '$_id',
                  updatedAt: 1,
                },
              },
            ],
          },
        },
        // Об'єднання результатів
        {
          $project: {
            result: { $concatArrays: ['$webinars', '$ethers'] },
          },
        },
        // Розгортання результату в один масив
        { $unwind: '$result' },
        { $replaceRoot: { newRoot: '$result' } },
        { $sort: { updatedAt: -1 } },
        { $project: { updatedAt: 0 } },
      ])
      .exec();

    return response.length === 0 ? [] : response;
  }

  async findWebinarById(webinarId: IdDto): Promise<WebinarEntity> {
    const response = await this.webinarModel
      .aggregate([
        // Фільтрація записів
        {
          $match: {
            _id: webinarId,
            toDelete: false,
            status: Status.PUBLISHED,
            category: {
              $in: [CategoryWebinar.WEBINARS, CategoryWebinar.TRAINING],
            },
          },
        },
        {
          $lookup: {
            from: 'discounts', // Колекція знижок
            let: { now: new Date() },
            localField: '_id', // Поле, яке зв'язує запис
            foreignField: 'refId', // Поле у колекції discounts
            as: 'discount', // Результат у полі discount
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
            status: 1,
            name: 1,
            cover: 1,
            price: 1,
            description: 1,
            detailsDescription: 1,
            detailsTitle: 1,
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
    if (response.length == 0) {
      throw new NotFoundException('Вебінари не знайдено');
    }
    return response[0];
  }
}
