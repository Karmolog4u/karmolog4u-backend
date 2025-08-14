import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  // Імʼя користувача
  @ApiProperty({
    type: String,
    description: 'Імʼя користувача',
    example: 'Іван',
    required: true,
  })
  @IsString({ message: 'Імʼя має бути рядком' })
  @IsNotEmpty({ message: 'Імʼя не повинно бути порожнім' })
  name: string;

  // Прізвище користувача
  @ApiProperty({
    type: String,
    description: 'Прізвище користувача',
    example: 'Петренко',
    required: true,
  })
  @IsString({ message: 'Прізвище має бути рядком' })
  @IsNotEmpty({ message: 'Прізвище не повинно бути порожнім' })
  lastName: string;

  // Номер мобільного телефону користувача
  @ApiProperty({
    type: String,
    description: 'Мобільний номер телефону користувача',
    example: '+380967788777',
    required: true,
  })
  @IsPhoneNumber(null, {
    message: 'Номер телефону має бути українським номером у форматі +380...',
  })
  mobPhone: string;

  // Email користувача
  @ApiProperty({
    type: String,
    description: 'Email адреса користувача',
    example: 'ivan.petrenko@gmail.com',
    required: true,
  })
  @IsEmail({}, { message: 'Некоректна email адреса' })
  email: string;

  // Пароль користувача
  @ApiProperty({
    type: String,
    description: 'Пароль користувача',
    example: 'StrongPass123',
    required: true,
  })
  @IsString({ message: 'Пароль повинен бути рядком' })
  @MinLength(6, {
    message: 'Пароль повинен містити щонайменше 6 символів',
  })
  password: string;

  // Поле "підтверджено", приховане в Swagger
  @ApiHideProperty()
  verified?: boolean;
}
