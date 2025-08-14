import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class PromoCodeEntity {
  @ApiProperty({
    type: Types.ObjectId,
    description: 'Id of the meditation',
    example: '6744d2c8bd8f6d722ff28c49',
    required: false,
  })
  _id: Types.ObjectId;

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

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Blocking the promo code',
    required: true,
  })
  blocked: boolean;

  @ApiProperty({
    type: String,
    description: 'The name of the product to which the promo code applies',
    example: 'webinars',
    required: true,
  })
  productName: string;

  @ApiProperty({
    type: String,
    description: 'The name of the collection to which the promo code applies',
    example: 'webinars',
    required: true,
  })
  collectionName: string;

  @ApiProperty({
    type: Types.ObjectId,
    description: 'Product ID to which the promo code applies',
    example: '6769bcb5e39c12c1f4ea9fe1',
    required: true,
  })
  refId: Types.ObjectId;
}
