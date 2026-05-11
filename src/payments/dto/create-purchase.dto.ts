import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum PaymentType {
  FULL = 'FULL', // повна оплата
  PARTIAL = 'PARTIAL', // часткова (розстрочка / перший платіж)
}

export class CreatePaymentDto {
  @ApiProperty({
    example: 'prod_12345',
    description: 'ID продукту або курсу',
  })
  @IsString()
  itemId: string;

  @ApiProperty({
    example: 'user@gmail.com',
    description: 'Email клієнта (обовʼязковий)',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: '+380671234567',
    description: 'Телефон клієнта',
  })
  @IsOptional()
  // @IsPhoneNumber('UA')
  phone?: string;

  @ApiPropertyOptional({
    example: 'PROMO2024',
    description: 'Промокод для знижки',
  })
  @IsOptional()
  @IsString()
  promocode?: string;

  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.FULL,
    description: 'Тип оплати: повна або часткова',
  })
  @IsEnum(PaymentType)
  paymentType: PaymentType;
}
