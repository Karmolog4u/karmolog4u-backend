import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProductPurchase,
  ProductPurchaseDocument,
} from 'src/productPurchase/schemas/productPurchase.schema';
import { AddProductsDto } from './dto/add-product-purchase.dto';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductPurchaseService {
  constructor(
    @InjectModel(ProductPurchase.name)
    private readonly productPurchaseModel: Model<ProductPurchaseDocument>, // @InjectModel(Course.name) private courseModel: Model<Course>
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async addProductPurchase(
    userId: string,
    productId: string,
    targetModule: 'Webinars' | 'Meditations' | 'GuidesAndBooks',
  ) {
    try {
      const existPurchase = await this.productPurchaseModel.findOne({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
        targetModule: targetModule,
      });
      if (existPurchase) {
        throw new BadRequestException('Користувач має такий продукт');
      }

      const purchase = await this.productPurchaseModel.create({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
        targetModule,
        createdAt: new Date(),
      });
      if (!purchase) {
        throw new BadRequestException(`Не вдалося створити покупку`);
      }

      const user = await this.userService.findUserById({
        _id: new Types.ObjectId(userId),
      });

      await this.mailService.sendEmail(
        user.email,
        'Ваш продукт доступний 🎉',
        'productNotify', // HBS template name
        {
          dashboardUrl: `${this.configService.get<string>(
            'FRONT_DOMAIN',
          )}/cabinet/login`,
        },
      );

      return purchase;
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }

  async addProductPurchases(userId: string, data: AddProductsDto) {
    const promises = data.products.map((i) =>
      this.addProductPurchase(userId, i.productId, i.targetModule),
    );

    return await Promise.all(promises);
  }

  async getAll() {
    try {
      const purchase = await this.productPurchaseModel.aggregate([
        {
          $lookup: {
            from: 'meditations', // назва колекції MongoDB
            localField: 'courseId',
            foreignField: '_id',
            as: 'meditation',
          },
        },
        {
          $lookup: {
            from: 'webinars',
            localField: 'courseId',
            foreignField: '_id',
            as: 'webinar',
          },
        },
        {
          $lookup: {
            from: 'guidesandbooks',
            localField: 'courseId',
            foreignField: '_id',
            as: 'guide',
          },
        },
        {
          $addFields: {
            product: {
              $cond: [
                { $gt: [{ $size: '$meditation' }, 0] },
                {
                  name: { $arrayElemAt: ['$meditation.name.uk', 0] },
                  targetModule: 'Meditation',
                },
                {
                  $cond: [
                    { $gt: [{ $size: '$webinar' }, 0] },
                    {
                      name: { $arrayElemAt: ['$webinar.name.uk', 0] },
                      targetModule: 'Webinar',
                    },
                    {
                      name: { $arrayElemAt: ['$guide.name.uk', 0] },
                      targetModule: 'GuidesAndBooks',
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            createdAt: 1,
            name: '$product.name',
            targetModule: '$product.targetModule',
          },
        },
        {
          $sort: { createdAt: -1 }, // останні покупки першими
        },
      ]);
      if (!purchase) {
        throw new Error();
      }
      return purchase;
    } catch (error) {
      throw new NotFoundException(
        'Покупку не знайдено або вона не належить користувачу',
      );
    }
  }

  async getUserPurchase(userId: string) {
    try {
      const purchases = await this.productPurchaseModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: 'meditations',
            localField: 'productId',
            foreignField: '_id',
            as: 'meditation',
          },
        },
        {
          $lookup: {
            from: 'webinars',
            localField: 'productId',
            foreignField: '_id',
            as: 'webinar',
          },
        },
        {
          $lookup: {
            from: 'guidesandbooks',
            localField: 'productId',
            foreignField: '_id',
            as: 'guide',
          },
        },
        {
          $addFields: {
            product: {
              $cond: [
                { $gt: [{ $size: '$meditation' }, 0] },
                {
                  name: { $arrayElemAt: ['$meditation.name.uk', 0] },
                  targetModule: 'Meditation',
                },
                {
                  $cond: [
                    { $gt: [{ $size: '$webinar' }, 0] },
                    {
                      name: { $arrayElemAt: ['$webinar.name.uk', 0] },
                      targetModule: 'Webinar',
                    },
                    {
                      $cond: [
                        { $gt: [{ $size: '$guide' }, 0] },
                        {
                          name: { $arrayElemAt: ['$guide.name.uk', 0] },
                          targetModule: 'GuidesAndBooks',
                        },
                        null,
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            id: '$_id',
            productId: 1,
            createdAt: 1,
            name: '$product.name',
            targetModule: '$product.targetModule',
            _id: 0,
          },
        },
        {
          $sort: { createdAt: -1 }, // новіші першими
        },
      ]);
      if (!purchases) {
        throw new Error();
      }
      return purchases;
    } catch (error) {
      throw new NotFoundException(
        'Покупку не знайдено або вона не належить користувачу',
      );
    }
  }

  async deletePurchase(purchaseId: string) {
    try {
      const deleted = await this.productPurchaseModel.findOneAndDelete({
        _id: new Types.ObjectId(purchaseId),
      });

      if (!deleted) {
        throw new Error();
      }

      return { message: 'success' };
    } catch (error) {
      throw new NotFoundException(
        'Покупку не знайдено або вона не належить користувачу',
      );
    }
  }
}
