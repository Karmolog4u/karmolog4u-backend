import { PromoCodeService } from './promo-code.service';
import { PromoCodeController } from './promo-code.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoCode, PromoCodeSchema } from './schemas/promo-code.schema';
import { DiscountModule } from '../products/discount/discount.module';
import { AdminMeditationModule } from '../products/meditations/admin-meditation.module';
import { AdminWebinarsModule } from '../products/webinars/admin-webinars.module';
import { AdminGuidesAndBooksModule } from '../products/guides_and_books/admin-guides_and_books.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromoCode.name, schema: PromoCodeSchema },
      // { name: Discount.name, schema: DiscountSchema },
    ]),
    DiscountModule,
    AdminMeditationModule,

    AdminWebinarsModule,
    AdminGuidesAndBooksModule,
  ],
  controllers: [PromoCodeController],
  providers: [PromoCodeService],
  exports: [PromoCodeService, MongooseModule],
})
export class PromoCodeModule {}
