import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDate,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({
    type: String,
    description: "Ім'я користувача",
    example: 'Іван',
  })
  @IsOptional()
  @IsString({ message: "Ім'я повинно бути текстовим значенням" })
  name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Прізвище користувача',
    example: 'Петренко',
  })
  @IsOptional()
  @IsString({ message: 'Прізвище повинно бути текстовим значенням' })
  lastName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Email користувача',
    example: 'ivan.petrenko@gmail.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некоректний формат email' })
  email?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Номер телефону користувача у форматі +380...',
    example: '+380967788777',
  })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Некоректний формат номера телефону' })
  mobPhone?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Чи підтверджено користувача',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'verified повинен бути булевим значенням' })
  verified?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Чи заблоковано користувача',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'banned повинен бути булевим значенням' })
  banned?: boolean;
}
