import { WebinarService } from './webinar.service';
import { WebinarController } from './webinar.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Webinar,
  WebinarSchema,
} from 'src/admin/products/webinars/schemas/webinars.schema';
import {
  Discount,
  DiscountSchema,
} from 'src/admin/products/discount/schemas/discount.schema';
import { DiscountModule } from 'src/admin/products/discount/discount.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Webinar.name, schema: WebinarSchema },
      { name: Discount.name, schema: DiscountSchema },
    ]),
    DiscountModule,
  ],
  controllers: [WebinarController],
  providers: [WebinarService],
  exports: [MongooseModule],
})
export class WebinarModule {}
