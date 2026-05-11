import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CategoryGuidesAndBooks,
  Description,
  Name,
  Status,
} from '../schemas/guides_and_books.schema';

class FileDto {
  @ApiProperty({ description: 'Saved file name on server' })
  savedName: string;

  @ApiProperty({ description: 'Original uploaded file name' })
  originalName: string;
}

class DiscountDto {
  @ApiProperty({ example: 10 })
  discount: number;

  @ApiProperty({ example: '2024-12-18T19:53:24.560Z' })
  start: Date;

  @ApiProperty({ example: '2025-02-18T19:53:24.560Z' })
  expiredAt: Date;
}

export class EditGuidesAndBooksDto {
  @ApiProperty({
    enum: CategoryGuidesAndBooks,
    enumName: 'CategoryGuidesAndBooks',
    description: 'Category of the guide/book',
    example: CategoryGuidesAndBooks.GUIDES,
  })
  category: CategoryGuidesAndBooks;

  @ApiPropertyOptional({
    type: Object,
    description: 'Name of the guide/book',
    example: { ru: 'Название', uk: 'Назва' },
    required: false,
  })
  name?: Name;

  @ApiPropertyOptional({
    type: Object,
    description: 'Description of the guide/book',
    example: { ru: 'Описание', uk: 'Опис' },
    required: false,
  })
  description?: Description;

  @ApiPropertyOptional({
    type: String,
    example: 'https://youtube.com/somevideo',
    description: 'Video link',
    required: false,
  })
  video?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 10,
    description: 'Price of the guide/book',
    required: false,
  })
  price?: number;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    description: 'Is the guide/book waiting',
    required: false,
  })
  isWaiting?: boolean;

  @ApiProperty({
    enum: Status,
    enumName: 'Status',
    description: 'Publication status',
    example: Status.PUBLISHED,
  })
  status: Status;

  @ApiPropertyOptional({ type: DiscountDto })
  discount?: DiscountDto;

  @ApiProperty({
    type: String,
    format: 'url',
    description: 'Cover image URL',
    required: false,
    example: 'https://example.com/cover.jpg',
  })
  cover?: string;

  @ApiPropertyOptional({ type: FileDto })
  file?: FileDto;
}
