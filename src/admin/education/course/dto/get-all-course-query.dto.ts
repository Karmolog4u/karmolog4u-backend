import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Define an enum for course types
enum AccessType {
  PERMANENT = 'PERMANENT',
  FOR_PERIOD = 'FOR_PERIOD',
  TO_DATE = 'TO_DATE',
}
enum CourseType {
  SSK_INDEPENDENT = 'SSK_INDEPENDENT',
  SSK_WITH_CURATOR = 'SSK_WITH_CURATOR',
  SSK_WITH_SERGIY = 'SSK_WITH_SERGIY',
  ADVANCED = 'ADVANCED',
  CONSULTING = 'CONSULTING',
}

enum CompletenessType {
  ALL = 'ALL',
  BY_LESSON = 'BY_LESSON',
}

export class GetAllCoursesQueryDto {
  @ApiPropertyOptional({
    description: 'Пошук по назві курсу',
    example: 'javascript',
  })
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @ApiPropertyOptional({
    description: 'Сортування за назвою курсу: 1 - ASC, -1 - DESC',
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
  @IsEnum(CourseType, { each: true }) // Ensures all values are valid CourseType enums
  type?: CourseType[];

  @ApiPropertyOptional({
    description: 'Сортування за типом доступу',
    example: 'PERMANENT,FOR_PERIOD',
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
  @IsEnum(AccessType, { each: true }) // Ensures value is valid enum type
  access?: AccessType[];

  @ApiPropertyOptional({
    description: 'Сортування за повнотою курсу',
    example: 'ALL,BY_LESSON',
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
  @IsEnum(CompletenessType, { each: true }) // Ensures only valid enum values
  completeness?: CompletenessType[];

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
