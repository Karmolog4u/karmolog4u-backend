import { AdminWebinarsService } from './admin-webinars.service';
import { AdminWebinarsController } from './admin-webinars.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Webinar, WebinarSchema } from './schemas/webinars.schema';
// import { Discount, DiscountSchema } from '../discount/schemas/discount.schema';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Webinar.name, schema: WebinarSchema },
      // { name: Discount.name, schema: DiscountSchema },
    ]),
    DiscountModule,
  ],
  controllers: [AdminWebinarsController],
  providers: [AdminWebinarsService],
  exports: [AdminWebinarsService, MongooseModule],
})
export class AdminWebinarsModule {}
