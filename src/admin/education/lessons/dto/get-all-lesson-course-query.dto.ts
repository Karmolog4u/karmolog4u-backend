import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

enum Type {
  PERMANENT = 'PERMANENT',
  FOR_PERIOD = 'FOR_PERIOD',
  TO_DATE = 'TO_DATE',
}

export class GetAllLessonCourseQueryDto {
  @ApiPropertyOptional({
    description: 'Пошук по назві курсу',
    example: 'javascript',
  })
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @ApiPropertyOptional({
    description: 'Сортування за типом курсу',
    example: 'SSK_INDEPENDENT,SSK_WITH_CURATOR,SSK_WITH_SERGIY', // Now as a comma-separated string
  })
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean); // Splits & removes empty values
    }
    return [];
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Type, { each: true }) // Ensures all values are valid CourseType enums
  type?: Type[];

  @ApiPropertyOptional({
    description: 'Course status',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
    example: 'DRAFT',
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVE'])
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVE';

  @ApiPropertyOptional({
    description: 'Сортування за назвою : 1 - ASC, -1 - DESC',
    example: 1,
    enum: [1, -1],
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value)) // Converts string to number
  @IsInt()
  @Min(-1)
  @Max(1)
  name?: 1 | -1;

  @ApiPropertyOptional({
    description: 'Сортування за часом : 1 - ASC, -1 - DESC',
    example: 1,
    enum: [1, -1],
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value)) // Converts string to number
  @IsInt()
  @Min(-1)
  @Max(1)
  dateStart?: 1 | -1;

  @ApiPropertyOptional({
    description: 'Кількість елементів на сторінці',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value)) // Converts string to number
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Номер сторінки для пагінації',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value)) // Converts string to number
  @IsInt()
  @Min(1)
  page?: number;
}
