import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreatePurchaseDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  courseId: Types.ObjectId;

  @IsEnum(['PERMANENT', 'FOR_PERIOD', 'TO_DATE'])
  accessType: 'PERMANENT' | 'FOR_PERIOD' | 'TO_DATE';

  @IsOptional()
  @IsDateString()
  accessStartDate?: Date;

  @IsOptional()
  @IsDateString()
  accessEndDate?: Date;

  @IsEnum(['ACTIVE', 'EXPIRED', 'BLOCKED'])
  status: string;

  @IsEnum(['FULL', 'PARTIAL', 'INSTALLMENT'])
  paymentPlan: string;

  @IsOptional()
  @IsMongoId({ each: true })
  lessonsUnlocked?: Types.ObjectId[];

  @IsBoolean()
  completed: boolean;

  @IsBoolean()
  agreement: boolean;

  @IsNumber()
  numberOfPractices: number;
}
