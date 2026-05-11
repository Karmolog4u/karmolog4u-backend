import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsMongoId,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

class CoursePurchaseItemDto {
  @ApiProperty({
    description: 'ID курсу',
    example: '64a872bd92c1d5412830c9a1',
  })
  @IsMongoId({ message: 'courseId має бути валідним MongoID' })
  courseId: string;

  @ApiProperty({
    description: 'План оплати',
    enum: ['FULL', 'PARTIAL', 'INSTALLMENT'],
    example: 'FULL',
  })
  @IsString({ message: 'paymentPlan має бути рядком' })
  @IsEnum(['FULL', 'PARTIAL', 'INSTALLMENT'], {
    message: 'paymentPlan має бути одним із: FULL, PARTIAL, INSTALLMENT',
  })
  paymentPlan: 'FULL' | 'PARTIAL' | 'INSTALLMENT';
}

export class AddCoursePurchaseDto {
  @ApiProperty({
    description: 'Масив курсів для покупки',
    type: [CoursePurchaseItemDto],
  })
  @IsArray({ message: 'courses має бути масивом' })
  @ArrayNotEmpty({ message: 'courses не може бути порожнім' })
  @ValidateNested({ each: true })
  @Type(() => CoursePurchaseItemDto)
  courses: CoursePurchaseItemDto[];
}
