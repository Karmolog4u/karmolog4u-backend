import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  ValidateNested,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum ModuleAccessType {
  PRACTICAL = 'PRACTICAL',
  THEORETICAL = 'THEORETICAL',
}
class AccessDto {
  @ApiProperty({
    example: '2025-06-01T00:00:00.000Z',
    description: 'Дата початку доступу',
  })
  @IsDateString()
  @IsNotEmpty()
  dateStart: Date;

  @ApiProperty({
    example: '2025-07-01T00:00:00.000Z',
    description: 'Дата завершення доступу',
  })
  @IsDateString()
  @IsNotEmpty()
  dateEnd: Date;
}

export class CreateModuleDto {
  @ApiProperty({ example: 'Basic Grammar', description: 'Назва модуля' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: ModuleAccessType.PRACTICAL,
    enum: ModuleAccessType,
    description: 'Тип доступу до модуля',
  })
  @IsEnum(ModuleAccessType)
  @IsNotEmpty()
  type: ModuleAccessType;

  @ApiProperty({ type: AccessDto, description: 'Період доступу до модуля' })
  @ValidateNested()
  @Type(() => AccessDto)
  access: AccessDto;

  @ApiProperty({ example: '30', description: 'Тривалість у днях' })
  @IsString()
  @IsNotEmpty()
  durationInDays: string;

  @ApiProperty({ example: '60af8840b6e3b12c4c8d9f3a', description: 'ID курсу' })
  @IsMongoId()
  @IsNotEmpty()
  course: string;
}
