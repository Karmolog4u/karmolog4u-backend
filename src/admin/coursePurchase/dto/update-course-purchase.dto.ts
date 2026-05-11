import {
  IsOptional,
  IsEnum,
  IsDate,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class UpdatePurchaseDto {
  @IsOptional()
  @IsEnum(['LIFETIME', 'PERIOD', 'RANGE'])
  accessType?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  accessStartDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  accessEndDate?: Date;

  @IsOptional()
  @IsEnum(['ACTIVE', 'EXPIRED', 'BLOCKED'])
  status?: string;

  @IsOptional()
  @IsEnum(['FULL', 'PARTIAL', 'INSTALLMENT'])
  paymentPlan?: string;

  @IsOptional()
  @IsArray()
  lessonsUnlocked?: mongoose.Types.ObjectId[];

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsBoolean()
  agreement?: boolean;

  @IsOptional()
  @IsNumber()
  numberOfPractices?: number;
}
