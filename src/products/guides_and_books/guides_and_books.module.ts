import { Module } from '@nestjs/common';
import { AdminGuidesAndBooksModule } from 'src/admin/products/guides_and_books/admin-guides_and_books.module';
import { GuidesAndBooksController } from './guides_and_books.controller';
import { GuidesAndBooksService } from './guides_and_books.service';

@Module({
  imports: [AdminGuidesAndBooksModule],
  controllers: [GuidesAndBooksController],
  providers: [GuidesAndBooksService],
  exports: [GuidesAndBooksModule, AdminGuidesAndBooksModule],
})
export class GuidesAndBooksModule {}
