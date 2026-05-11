import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetAllEventsDto {
  @ApiProperty({ example: 1, description: 'Page number' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number;

  @ApiPropertyOptional({ example: 'search term', description: 'Search term' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  search?: string;

  @ApiProperty({ example: 'PUBLISHED', description: 'Event status' })
  @Transform(({ value }) => value.trim())
  @IsEnum(['PUBLISHED', 'DRAFT', 'ARCHIVE'])
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVE';
}
