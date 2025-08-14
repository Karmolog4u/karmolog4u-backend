import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetAllLessonModuleQueryDto {
  @ApiPropertyOptional({
    description: 'Course status',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
    example: 'DRAFT',
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVE'])
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVE';

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
