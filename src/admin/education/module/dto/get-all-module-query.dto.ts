import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

enum ModuleAccessType {
  PRACTICAL = 'PRACTICAL',
  THEORETICAL = 'THEORETICAL',
}

export class GetAllModuleQueryDto {
  @ApiPropertyOptional({ description: 'Пошуковий запит (назва модуля)' })
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @ApiPropertyOptional({
    enum: [1, -1],
    description: 'Сортування за іменем: 1 - ASC, -1 - DESC',
  })
  @IsOptional()
  @IsIn([1, -1])
  @Type(() => Number)
  name?: 1 | -1;

  @ApiPropertyOptional({
    description: 'Сортування за типом модуля',
    example: 'PRACTICAL,THEORETICAL', // Now as a comma-separated string
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
  @IsEnum(ModuleAccessType, { each: true }) // Ensures all values are valid CourseType enums
  type?: string[];

  @ApiPropertyOptional({
    enum: [1, -1],
    description: 'Сортування за іменем: 1 - ASC, -1 - DESC',
  })
  @IsOptional()
  @IsIn([1, -1])
  @Type(() => Number)
  access?: 1 | -1;

  @ApiPropertyOptional({
    description: 'Кількість елементів на сторінку',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Номер сторінки', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
