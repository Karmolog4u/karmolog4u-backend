import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
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
    example: 'ivan.petrenko@gmail.com',
  })
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Номер телефону користувача (у форматі +380)',
    example: '+380967788777',
  })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Невірний формат номера телефону' })
  mobPhone?: string;
}

export class ImportUsersDto {
  @ApiProperty({
    description: 'Масив користувачів, яких потрібно імпортувати',
    type: [UserDto],
    example: [
      {
        name: 'Іван',
        lastName: 'Петренко',
        mobPhone: '+380967788777',
        email: 'ivan.petrenko@gmail.com',
      },
      {
        name: 'Олена',
        lastName: 'Шевченко',
        mobPhone: '+380931234567',
        email: 'olena.shevchenko@gmail.com',
      },
    ],
  })
  @IsArray({ message: 'users має бути масивом' })
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  users: UserDto[];

  @ApiProperty({
    type: Boolean,
    description: 'Чи згенерувати пароль і надіслати на email',
    example: false,
  })
  @IsBoolean({ message: 'sendToEmail має бути булевим значенням' })
  sendToEmail: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Чи підтверджений користувач',
    example: false,
  })
  @IsBoolean({ message: 'verified має бути булевим значенням' })
  verified: boolean;
}
