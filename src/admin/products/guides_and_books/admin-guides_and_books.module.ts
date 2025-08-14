import { AdminGuidesAndBooksService } from './admin-guides_and_books.service';
import { AdminGuidesAndBooksController } from './admin-guides_and_books.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GuidesAndBooks,
  GuidesAndBooksSchema,
} from './schemas/guides_and_books.schema';
// import { Discount, DiscountSchema } from '../discount/schemas/discount.schema';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GuidesAndBooks.name, schema: GuidesAndBooksSchema },
      // { name: Discount.name, schema: DiscountSchema },
    ]),
    DiscountModule,
  ],
  controllers: [AdminGuidesAndBooksController],
  providers: [AdminGuidesAndBooksService],
  exports: [AdminGuidesAndBooksService, MongooseModule],
})
export class AdminGuidesAndBooksModule {}
