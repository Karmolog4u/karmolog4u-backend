import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum AccessType {
  PERMANENT = 'PERMANENT',
  FOR_PERIOD = 'FOR_PERIOD',
  TO_DATE = 'TO_DATE',
}

enum Status {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVE = 'ARCHIVE',
}
export class VideoLinkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;
}

class AdditionalLinkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;
}

class FileDto {
  [x: string]: any;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  savedName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  path?: string;
}

class AccessDto {
  @ApiPropertyOptional({ enum: AccessType })
  @IsOptional()
  @IsEnum(AccessType)
  type: AccessType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  months?: number;
}

export class UpdateLessonDto {
  @ApiProperty({ description: 'Назва уроку' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalDescription?: string;

  @ApiPropertyOptional({ type: AccessDto })
  @ValidateNested()
  @Type(() => AccessDto)
  access?: AccessDto;

  @ApiPropertyOptional({ type: [VideoLinkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoLinkDto)
  videoLinks?: VideoLinkDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendation?: string;

  @ApiPropertyOptional({ type: [AdditionalLinkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalLinkDto)
  additionalLinks?: AdditionalLinkDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homework?: string;

  @ApiPropertyOptional({ type: [FileDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  // @Type(() => FileDto)
  homeworkFiles?: FileDto[];

  @ApiPropertyOptional({ type: [FileDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  // @Type(() => FileDto)
  bonusFiles?: FileDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  feedbacks?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  moduleDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  modulePart?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lessonTimeStart?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lessonTimeEnd?: Date;

  @ApiPropertyOptional({ description: 'статус уроку', enum: Status })
  @IsEnum(Status)
  status: string;
}
