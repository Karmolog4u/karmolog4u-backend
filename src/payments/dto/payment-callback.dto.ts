import { ApiProperty } from '@nestjs/swagger';

export class PaymentCallbackDto {
  @ApiProperty()
  orderReference: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  signature: string;
}
