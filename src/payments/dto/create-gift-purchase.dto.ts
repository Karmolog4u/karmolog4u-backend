import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';

export class CreateGiftPayment {
  @ApiProperty({
    example: '66d123456789abcdef123456',
  })
  @IsMongoId()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    example: 'grynbest93@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Артем23 Тест',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '+38095111116',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '123123',
    required: false,
  })
  @IsOptional()
  @IsString()
  promocode?: string;

  @ApiProperty({
    example: 'м. Львів, Львівська обл.',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: 'Відділення №1: вул. Городоцька, 359',
  })
  @IsString()
  @IsNotEmpty()
  warehouse: string;
}
