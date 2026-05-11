import { Module } from '@nestjs/common';
import { MeditationModule } from './meditations/meditation.module';
import { WebinarModule } from './webinars/webinar.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { GuidesAndBooksModule } from './guides_and_books/guides_and_books.module';
import { GiftModule } from './gifts/gift.module';

@Module({
  imports: [MeditationModule, WebinarModule, GuidesAndBooksModule, GiftModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
