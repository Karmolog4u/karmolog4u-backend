import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  // Email користувача
  @ApiProperty({
    type: String,
    description: 'Електронна пошта користувача',
    example: 'ivan.petrenko@gmail.com',
    required: true,
  })
  @IsEmail({}, { message: 'Некоректна email адреса' })
  email: string;
}
