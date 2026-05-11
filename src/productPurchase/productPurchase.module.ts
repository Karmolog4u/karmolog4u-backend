import { Module } from '@nestjs/common';
import {
  ProductPurchase,
  ProductPurchaseSchema,
} from './schemas/productPurchase.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductPurchaseService } from './productPurchase.service';
import { ProductPurchaseController } from './productPurchase.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductPurchase.name, schema: ProductPurchaseSchema },
    ]),
  ],
  controllers: [ProductPurchaseController],
  providers: [ProductPurchaseService],
  exports: [MongooseModule],
})
export class ProductPurchaseModule {}
