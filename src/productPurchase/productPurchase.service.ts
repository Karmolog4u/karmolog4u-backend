import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProductPurchase,
  ProductPurchaseDocument,
} from './schemas/productPurchase.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ProductPurchaseService {
  constructor(
    @InjectModel(ProductPurchase.name)
    private readonly productPurchaseModel: Model<ProductPurchaseDocument>,
  ) {}

  async getAllProducts(
    userId: Types.ObjectId,
    type: 'Webinars' | 'Meditations' | 'GuidesAndBooks',
  ) {
    let collection = '';
    if (type === 'Webinars') collection = 'webinars';
    if (type === 'Meditations') collection = 'meditations';
    if (type === 'GuidesAndBooks') collection = 'guidesandbooks';

    const products = await this.productPurchaseModel.aggregate([
      {
        $match: {
          userId: userId,
          targetModule: type,
        },
      },
      {
        $lookup: {
          from: collection,
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $project: {
          id: '$product._id',
          name: '$product.name.uk', // якщо name багатомовний
          cover: '$product.cover',
          _id: 0,
          category: '$product.category',
        },
      },
    ]);

    return products;
  }
}
