import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

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
    type: [String],
    description: 'Масив ID курсів або освітніх програм',
    example: ['64a872bd92c1d5412830c9a1', '64a872bd92c1d5412830c9a2'],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'education має бути масивом' })
  education?: string[];

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
