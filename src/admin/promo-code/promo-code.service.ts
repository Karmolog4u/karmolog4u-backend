import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PromoCode } from './schemas/promo-code.schema';
import { Model, Types } from 'mongoose';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { EditPromoCodeDto } from './dto/edit-promo-code.dto';
import { PromoCodeEntity } from './dto/promo-code-entity.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { DiscountService } from '../products/discount/discount.service';
import { Webinar } from '../products/webinars/schemas/webinars.schema';
import { Meditation } from 'src/products/meditations/schemas/meditation.schema';
import { GuidesAndBooks } from '../products/guides_and_books/schemas/guides_and_books.schema';

@Injectable()
export class PromoCodeService {
  constructor(
    @Inject(DiscountService) private discountService: DiscountService,
    @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCode>,
    @InjectModel(Webinar.name) private webinarModel: Model<Webinar>,
    @InjectModel(Meditation.name) private meditationModel: Model<Meditation>,

    @InjectModel(GuidesAndBooks.name)
    private guidesAndBooksModel: Model<GuidesAndBooks>,
  ) {}

  async createPromoCode(data: CreatePromoCodeDto): Promise<ResponseSuccessDto> {
    try {
      const promoCode = new this.promoCodeModel(data);
      await promoCode.save();
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }
  async editPromoCode(
    data: EditPromoCodeDto,
    id: IdDto,
  ): Promise<PromoCodeEntity> {
    try {
      return await this.promoCodeModel
        .findOneAndUpdate({ _id: id }, data, {
          upsert: true,
          new: true,
        })
        .exec();
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async deletePromoCodes(ids: Types.ObjectId[]): Promise<ResponseSuccessDto> {
    try {
      await this.promoCodeModel.deleteMany({ _id: { $in: ids } });
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async deleteByRefIdPromoCodes(
    ids: Types.ObjectId[],
  ): Promise<ResponseSuccessDto> {
    try {
      await this.promoCodeModel.deleteMany({ refId: { $in: ids } });
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async findPromoCodeById(id: IdDto): Promise<any> {
    try {
      const response = await this.promoCodeModel
        .aggregate([
          {
            $match: { _id: id }, // Знаходимо промокод за _id
          },
          {
            $lookup: {
              from: 'discounts', // Назва колекції зі знижками
              localField: 'refId', // Поле для зв’язку
              foreignField: 'refId',
              as: 'discount',
              pipeline: [
                {
                  $project: {
                    _id: 0,
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
              name: 1,
              start: 1,
              end: 1,
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
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }
  async findAllPromoCode(
    searchQuery: string,
    page: number,
    limit: number,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    try {
      const response = await this.promoCodeModel
        .aggregate([
          {
            $lookup: {
              from: 'discounts',
              localField: 'refId',
              foreignField: 'refId',
              as: 'discount',
              pipeline: [
                {
                  $project: {
                    _id: 0,
                    discount: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              discount: { $first: '$discount' },
            },
          },
          {
            $project: {
              _id: 1,
              productName: 1,
              usedCounter: 1,
              name: 1,
              start: 1,
              end: 1,
              blocked: 1,
              promoDiscount: 1,
              refId: 1,
              discount: { $ifNull: ['$discount', '$$REMOVE'] },
            },
          },
          ...(searchQuery?.trim()
            ? [
                {
                  $match: {
                    $or: [{ name: { $regex: searchQuery, $options: 'i' } }],
                  },
                },
              ]
            : []),
          {
            $facet: {
              paginatedData: [{ $skip: skip }, { $limit: limit }],
              totalCount: [{ $count: 'count' }],
            },
          },
          {
            $project: {
              data: '$paginatedData',
              totalPromo: {
                $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0],
              },
            },
          },
        ])
        .exec();

      return response[0];
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }
  async blockPromoCode(id: IdDto): Promise<ResponseSuccessDto> {
    try {
      await this.promoCodeModel.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            blocked: { $not: ['$blocked'] },
          },
        },
        { new: true },
      );
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException(error._message + ', Mongo DB');
    }
  }

  async getAllProductsPromoCode(searchQuery: string) {
    try {
      return await this.webinarModel.aggregate([
        {
          $match: { toDelete: false }, // Filter for webinars
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
            collection: 'webinars',
          },
        },
        {
          $project: {
            id: '$_id', // Змінюємо назву поля _id на id
            'name.uk': 1,
            collection: 1,
            _id: 0, // Прибираємо оригінальне поле _id
            discount: {
              $cond: {
                if: { $ne: ['$discount', null] }, // Якщо discount не дорівнює null
                then: '$discount', // Залишити поле
                else: '$$REMOVE', // Виключити поле з результату
              },
            },
          },
        },
        {
          $unionWith: {
            coll: 'meditations', // Union with the 'meditation' collection
            pipeline: [
              { $match: { toDelete: false } },
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
                  collection: 'meditations',
                },
              },
              {
                $project: {
                  id: '$_id', // Змінюємо назву поля _id на id
                  'name.uk': 1,
                  collection: 1,
                  _id: 0, // Прибираємо оригінальне поле _id
                  discount: {
                    $cond: {
                      if: { $ne: ['$discount', null] }, // Якщо discount не дорівнює null
                      then: '$discount', // Залишити поле
                      else: '$$REMOVE', // Виключити поле з результату
                    },
                  },
                },
              },
            ], // Filter for meditation
          },
        },
        {
          $unionWith: {
            coll: 'guidesandbooks', // Union with the 'guidesandbooks' collection
            pipeline: [
              { $match: { toDelete: false } },
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
                  collection: 'guidesAndBooks',
                },
              },
              {
                $project: {
                  id: '$_id', // Змінюємо назву поля _id на id
                  'name.uk': 1,
                  collection: 1,
                  _id: 0, // Прибираємо оригінальне поле _id
                  discount: {
                    $cond: {
                      if: { $ne: ['$discount', null] }, // Якщо discount не дорівнює null
                      then: '$discount', // Залишити поле
                      else: '$$REMOVE', // Виключити поле з результату
                    },
                  },
                },
              },
            ], // Filter for guides and books
          },
        },
        // Add the $search stage for searchQuery (if provided)
        ...(searchQuery
          ? [
              {
                $match: {
                  $or: [
                    { 'name.ru': { $regex: searchQuery, $options: 'i' } }, // Пошук в "name.ru"
                    { 'name.uk': { $regex: searchQuery, $options: 'i' } }, // Пошук в "name.uk"
                  ],
                },
              },
            ]
          : []),
        // {
        //   $facet: {
        //     paginatedData: [
        //       { $skip: skip }, // Apply skip for pagination
        //       { $limit: limit }, // Apply limit for pagination
        //     ],
        //     totalCount: [
        //       { $count: 'count' }, // Count the total number of documents
        //     ],
        //   },
        // },
        // {
        //   $project: {
        //     data: '$paginatedData', // Paginated data
        //     totalProducts: {
        //       $arrayElemAt: ['$totalCount.count', 0], // Total count of products
        //     },
        //   },
        // },
      ]);
    } catch (error) {
      throw new NotFoundException('Видалених продуктів не знайдено');
    }
  }
}
