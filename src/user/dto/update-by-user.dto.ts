import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateByUserDto {
  @ApiPropertyOptional({
    example: 'Іван',
    description: "Ім'я користувача",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Петренко',
    description: 'Прізвище користувача',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: '+380971234567',
    description: 'Мобільний телефон користувача',
  })
  @IsOptional()
  @IsString()
  mobPhone?: string;

  @ApiPropertyOptional({
    example: 'ivan.petrenko@example.com',
    description: 'Електронна пошта користувача',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/avatar.jpg',
    description: 'Посилання на обкладинку/аватар користувача',
  })
  @IsOptional()
  @IsString()
  cover?: string;
}
