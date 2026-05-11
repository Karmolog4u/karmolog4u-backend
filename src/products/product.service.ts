import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Webinar } from 'src/admin/products/webinars/schemas/webinars.schema';
import { GuidesAndBooks } from 'src/admin/products/guides_and_books/schemas/guides_and_books.schema';
import { Meditation } from './meditations/schemas/meditation.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Webinar.name) private webinarModel: Model<Webinar>,
    @InjectModel(Meditation.name) private meditationModel: Model<Meditation>,
    @InjectModel(GuidesAndBooks.name)
    private guidesAndBooksModel: Model<GuidesAndBooks>,
  ) {}

  async getProductDetails(productId: string) {
    const id = new Types.ObjectId(productId);

    // Пробуємо знайти у вебінарах
    const webinar = await this.webinarModel.findById(id).lean();
    if (webinar) {
      return webinar;
    }

    // Пробуємо знайти у медитаціях
    const meditation = await this.meditationModel.findById(id).lean();
    if (meditation) {
      return meditation;
    }

    // Пробуємо знайти у гайдах
    const guide = await this.guidesAndBooksModel
      .findById(id)
      .populate({ path: 'file', select: 'path originalName -_id' })
      .lean();

    if (guide) {
      return guide;
    }

    throw new NotFoundException(`Продукт з id ${productId} не знайдено`);
  }

  async getAllProductsWithPrice(userId: Types.ObjectId) {
    const [meditations, webinars, guides] = await Promise.all([
      this.meditationModel.aggregate([
        // 1. Брати тільки з ціною
        {
          $match: {
            price: { $exists: true, $gt: 0 },
            status: 'PUBLISHED',
          },
        },
        // 2. Підтягнути покупки користувача
        {
          $lookup: {
            from: 'productpurchases',
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$productId', '$$productId'] },
                      { $eq: ['$userId', userId] },
                      { $eq: ['$targetModule', 'Meditations'] },
                    ],
                  },
                },
              },
            ],
            as: 'userPurchase',
          },
        },
        // 3. Відкинути куплені
        {
          $match: {
            userPurchase: { $size: 0 },
          },
        },
        // 4. Вибрати потрібні поля
        {
          $project: {
            id: '$_id',
            _id: 0,
            name: '$name.uk',
            cover: 1,
            price: 1,
            targetModule: { $literal: 'Meditations' },
          },
        },
      ]),

      await this.webinarModel.aggregate([
        // 1. Брати тільки з ціною
        {
          $match: {
            price: { $exists: true, $gt: 0 },
            status: 'PUBLISHED',
          },
        },
        // 2. Підтягнути покупки користувача
        {
          $lookup: {
            from: 'productpurchases',
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$productId', '$$productId'] },
                      { $eq: ['$userId', userId] },
                      { $eq: ['$targetModule', 'Webinars'] },
                    ],
                  },
                },
              },
            ],
            as: 'userPurchase',
          },
        },
        // 3. Відкинути куплені
        {
          $match: {
            userPurchase: { $size: 0 },
          },
        },
        // 4. Вибрати потрібні поля
        {
          $project: {
            id: '$_id',
            _id: 0,
            name: '$name.uk',
            cover: 1,
            price: 1,
            targetModule: { $literal: 'Webinars' },
          },
        },
      ]),
      await this.guidesAndBooksModel.aggregate([
        // 1. Брати тільки з ціною
        {
          $match: {
            price: { $exists: true, $gt: 0 },
            status: 'PUBLISHED',
          },
        },
        // 2. Підтягнути покупки користувача
        {
          $lookup: {
            from: 'productpurchases',
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$productId', '$$productId'] },
                      { $eq: ['$userId', userId] },
                      { $eq: ['$targetModule', 'GuidesAndBooks'] },
                    ],
                  },
                },
              },
            ],
            as: 'userPurchase',
          },
        },
        // 3. Відкинути куплені
        {
          $match: {
            userPurchase: { $size: 0 },
          },
        },
        // 4. Вибрати потрібні поля
        {
          $project: {
            id: '$_id',
            _id: 0,
            name: '$name.uk',
            cover: 1,
            price: 1,
            targetModule: { $literal: 'GuidesAndBooks' },
          },
        },
      ]),
    ]);

    return [...meditations, ...webinars, ...guides];
  }

  async getProductTypeById(
    id: string,
  ): Promise<'webinar' | 'meditation' | 'guide' | null> {
    const [webinar, meditation, guide] = await Promise.all([
      this.webinarModel.exists({ _id: id }),
      this.meditationModel.exists({ _id: id }),
      this.guidesAndBooksModel.exists({ _id: id }),
    ]);

    if (webinar) return 'webinar';
    if (meditation) return 'meditation';
    if (guide) return 'guide';

    return null;
  }
}
