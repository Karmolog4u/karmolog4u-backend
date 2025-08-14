import { ApiProperty } from '@nestjs/swagger';

export class EditPromoCodeDto {
  @ApiProperty({
    type: String,
    description: 'Name of the promo code',
    example: 'ZALUPA',
    required: true,
  })
  name: string;

  @ApiProperty({
    type: Number,
    example: 10,
    description: 'Discount promo code',
    required: true,
  })
  promoDiscount: number;

  @ApiProperty({
    type: Date,
    description: 'Start date of the promo code',
    example: '2024-12-23T19:40:37.539+00:00',
    required: false,
  })
  start: Date;

  @ApiProperty({
    type: Date,
    description: 'End date of the promo code',
    example: '2024-12-23T19:40:37.539+00:00',
    required: true,
  })
  end: Date;
}
