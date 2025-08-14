import { Module } from '@nestjs/common';
import { AdminMeditationModule } from './meditations/admin-meditation.module';
import { AdminProductController } from './admin-product.controller';
import { DiscountModule } from './discount/discount.module';
import { AdminWebinarsModule } from './webinars/admin-webinars.module';
import { AdminGuidesAndBooksModule } from './guides_and_books/admin-guides_and_books.module';
import { DeletedModule } from './deleted/deleted.module';
import { GiftModule } from './gift/gift.module';

@Module({
  imports: [
    AdminMeditationModule,
    DiscountModule,
    AdminWebinarsModule,
    AdminGuidesAndBooksModule,
    GiftModule,
    DeletedModule,
  ],
  controllers: [AdminProductController],
  providers: [],
  exports: [],
})
export class AdminProductModule {}
