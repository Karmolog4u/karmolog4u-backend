import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsDate,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

class OptionalFiles {
  @ApiProperty({
    description: 'Original name of file',
    example: 'file.png',
  })
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'name of file in storage',
    example: '11332211.png',
  })
  @IsString()
  savedName: string;

  @ApiPropertyOptional({
    description: 'path of file in storage',
    example:
      'education/68444ba1d97543c9cd424b65/materials/1749306350104_882e27ab-0f1a-4b1e-84b9-c6ee6a3d8dcd1749306350104.pdf',
  })
  @IsString()
  path: string;
}

class Access {
  @ApiProperty({
    description: 'Access type',
    enum: ['PERMANENT', 'FOR_PERIOD', 'TO_DATE'],
    example: 'PERMANENT',
  })
  @IsEnum(['PERMANENT', 'FOR_PERIOD', 'TO_DATE'])
  type: 'PERMANENT' | 'FOR_PERIOD' | 'TO_DATE';

  @ApiPropertyOptional({
    description: 'Access start date',
    example: '2025-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  dateStart?: Date;

  @ApiPropertyOptional({
    description: 'Access end date',
    example: '2025-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  dateEnd?: Date;
}

class Point {
  @ApiProperty({ description: 'Name of the point', example: 'Early Access' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the point',
    example: 'You will get early access to materials.',
  })
  @IsString()
  description: string;
}

class Contract {
  @ApiProperty({
    description: 'Date of the contract',
    example: '2025-07-01T00:00:00.000Z',
  })
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Sign-up deadline',
    example: '2025-06-30T00:00:00.000Z',
  })
  @IsDate()
  signUpTo: Date;

  @ApiPropertyOptional({ description: 'Optional price', example: 299.99 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'Contract header',
    example: 'Special Summer Offer',
  })
  @IsString()
  header: string;

  @ApiProperty({ description: 'List of contract points', type: [Point] })
  @IsArray()
  points: Point[];
}

class Literature {
  @ApiProperty({ description: 'Author', example: 'John Doe' })
  @IsString()
  author: string;

  @ApiProperty({
    description: 'Resource link',
    example: 'https://example.com/book',
  })
  @IsString()
  link: string;
}

class OptionalLink {
  @ApiProperty({
    description: 'Назва посилання',
    example: 'Документація',
  })
  name: string;

  @ApiProperty({
    description: 'URL посилання',
    example: 'https://example.com/doc',
  })
  link: string;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Advanced JavaScript', description: 'Course name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'SSK_WITH_CURATOR',
    description: 'Course type',
    enum: [
      'SSK_INDEPENDENT',
      'SSK_WITH_CURATOR',
      'SSK_WITH_SERGIY',
      'ADVANCED',
      'CONSULTING',
    ],
  })
  @IsEnum([
    'SSK_INDEPENDENT',
    'SSK_WITH_CURATOR',
    'SSK_WITH_SERGIY',
    'ADVANCED',
    'CONSULTING',
  ])
  type: string;

  @ApiProperty({
    example: 'ALL',
    description: 'Completeness mode',
    enum: ['ALL', 'BY_LESSON'],
  })
  @IsEnum(['ALL', 'BY_LESSON'])
  completeness: string;

  @ApiProperty({ description: 'Access details', type: Access })
  access: Access;

  @ApiPropertyOptional({ description: 'Contract details', type: Contract })
  contract?: Contract;

  @ApiPropertyOptional({
    example: 'https://chat.example.com',
    description: 'Chat link',
  })
  @IsOptional()
  @IsString()
  chat?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/file1.pdf'],
    description: 'Additional files',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalFiles?: string[];

  @ApiPropertyOptional({
    type: [OptionalLink],
  })
  @IsOptional()
  @IsArray()
  optionalLink?: OptionalLink[];

  @ApiPropertyOptional({
    type: [OptionalFiles],
  })
  @IsOptional()
  @IsArray()
  optionalFiles?: OptionalFiles[];

  @ApiPropertyOptional({
    example: 'https://example.com/invoice',
    description: 'Invoice link',
  })
  @IsOptional()
  @IsString()
  practiceInvoice?: string;

  @ApiProperty({ example: 1, description: 'Stream number' })
  @IsNumber()
  stream: number;

  @ApiProperty({ example: 199.99, description: 'Course price' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    description: 'Recommended literature',
    type: [Literature],
  })
  @IsOptional()
  @IsArray()
  literature?: Literature[];

  @ApiPropertyOptional({
    example: 'https://example.com/cover.jpg',
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? encodeURI(value) : value,
  )
  @IsUrl(
    {
      require_tld: false, // ❗ дозволити локальні домени типу localhost
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    { message: 'Cover must be a valid URL' },
  )
  cover?: string;

  @ApiProperty({
    description: 'Course status',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
    example: 'DRAFT',
  })
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVE'])
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVE';
}
