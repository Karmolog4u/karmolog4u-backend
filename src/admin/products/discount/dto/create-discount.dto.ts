import { Types } from 'mongoose';

export class CreateDiscountDto {
  /**
  Fixed discount amount in the product currency
  @example "8"
  */
  discount: number;
  /**
  Discount start date
  @example "date"
  */
  start: Date;
  /**
  Discount end date
  @example "date"
  */
  expiredAt: Date;
  refId: Types.ObjectId;
}
