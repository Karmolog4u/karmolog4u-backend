import { Module } from '@nestjs/common';
import { AdminPaymentsController } from './payments.controller';
import { AdminPaymentServices } from './payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from 'src/payments/schemas/purchase.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
  ],
  controllers: [AdminPaymentsController],
  providers: [AdminPaymentServices],
})
export class AdminPaymentModule {}
