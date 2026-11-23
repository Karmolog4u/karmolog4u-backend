import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EducationCourseDto {
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
  @IsEnum(['FULL', 'PARTIAL', 'INSTALLMENT'], {
    message: 'paymentPlan має бути одним із: FULL, PARTIAL, INSTALLMENT',
  })
  paymentPlan: 'FULL' | 'PARTIAL' | 'INSTALLMENT';
}

export class CreateUserByAdminDto {
  @ApiProperty({
    type: String,
    description: "Ім'я користувача",
    example: 'Іван',
  })
  @IsString()
  @IsNotEmpty({ message: "Ім'я не може бути порожнім" })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Прізвище користувача',
    example: 'Петренко',
  })
  @IsString()
  @IsNotEmpty({ message: 'Прізвище не може бути порожнім' })
  lastName: string;

  @ApiProperty({
    type: String,
    description: 'Email користувача',
    example: 'ivan.petrenko@example.com',
  })
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Мобільний телефон користувача',
    example: '+380967788777',
  })
  @IsPhoneNumber(null, { message: 'Невірний формат номера телефону' })
  mobPhone: string;

  @ApiProperty({
    type: [EducationCourseDto],
    description: 'Курси та плани оплати, які потрібно додати користувачу',
    example: [
      { courseId: '64a872bd92c1d5412830c9a1', paymentPlan: 'FULL' },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'education має бути масивом' })
  @ValidateNested({ each: true })
  @Type(() => EducationCourseDto)
  education?: EducationCourseDto[];

  @ApiProperty({
    type: Boolean,
    description: 'Згенерувати пароль та надіслати на email',
    example: false,
  })
  @IsBoolean({ message: 'sendToEmail має бути булевим значенням' })
  sendToEmail: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Чи підтверджено користувача',
    example: false,
  })
  @IsBoolean({ message: 'verified має бути булевим значенням' })
  verified: boolean;
}
