import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  // Email користувача
  @ApiProperty({
    type: String,
    description: 'Електронна пошта користувача',
    example: 'ivan.petrenko@gmail.com',
    required: true,
  })
  @IsEmail({}, { message: 'Некоректна email адреса' })
  email: string;

  // Пароль користувача
  @ApiProperty({
    type: String,
    description: 'Пароль для входу',
    example: 'StrongPass123',
    required: true,
  })
  @IsString({ message: 'Пароль повинен бути рядком' })
  @MinLength(6, {
    message: 'Пароль повинен містити щонайменше 6 символів',
  })
  password: string;
}
