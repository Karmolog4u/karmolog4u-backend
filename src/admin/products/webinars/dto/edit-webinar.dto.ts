import { ApiProperty } from '@nestjs/swagger';
import {
  CategoryWebinar,
  Description,
  DetailsDescription,
  DetailsTitle,
  WebinarVideo,
  Name,
  Status,
} from '../schemas/webinars.schema';

export class EditWebinarDto {
  @ApiProperty({
    enum: CategoryWebinar,
    enumName: 'CategoryWebinar',
    description: 'Category of the webinar',
    example: CategoryWebinar.WEBINARS,
    required: true,
  })
  category: string;

  @ApiProperty({
    type: Name,
    description: 'Name of the meditation',
    example: { ru: 'some name', uk: 'some name' },
    required: false,
  })
  name: Name;

  @ApiProperty({
    type: Description,
    description: 'Description of the meditation',
    example: { ru: 'some description', uk: 'some description' },
    required: false,
  })
  description?: DetailsTitle;

  @ApiProperty({
    type: Description,
    description: 'DetailsTitle of the meditation',
    example: { ru: 'some description', uk: 'some description' },
    required: false,
  })
  detailsTitle?: DetailsTitle;

  @ApiProperty({
    type: DetailsDescription,
    description: 'DetailsDescription of the meditation',
    example: { ru: 'some description', uk: 'some description' },
    required: false,
  })
  detailsDescription?: DetailsDescription;

  @ApiProperty({
    type: WebinarVideo,
    example: { video: 'video link', playlist: 'playlist link' },
    description: 'Video of the meditation',
    required: false,
  })
  video?: WebinarVideo;

  @ApiProperty({
    type: Number,
    description: 'Price of the meditation',
    example: 10,
    required: false,
  })
  price?: number;

  @ApiProperty({
    type: Boolean,
    description: 'Status on waiting of the meditation',
    example: false,
    required: false,
  })
  isWaiting?: boolean;

  @ApiProperty({
    enum: Status,
    enumName: 'Status', // Ім'я, яке відображатиметься у Swagger
    description: 'Status of the meditation',
    example: Status.PUBLISHED,
    required: true,
  })
  status: Status;

  @ApiProperty({
    type: Object,
    description: 'Discount amount in the product currency',
    example: {
      discount: 10,
      start: '2024-12-18T19:53:24.560Z',
      expiredAt: '2024-12-18T19:53:24.560Z',
    },
    required: false,
  })
  discount?: { discount: number; start: Date; expiredAt: Date };

  @ApiProperty({
    oneOf: [
      {
        type: 'string',
        format: 'binary',
        description: 'The image file to upload',
      }, // Описуємо файл
      { type: 'string', format: 'url', description: 'The URL of the image' }, // Описуємо рядок як URL
    ],
    description: 'The cover image, can be either a URL or a file.',
    required: false, // Поле не обов\'язкове
  })
  cover?: any; // Поле може бути файлом або рядком
}
