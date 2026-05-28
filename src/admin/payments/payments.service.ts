import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseStatus } from 'src/payments/schemas/purchase.schema';

@Injectable()
export class AdminPaymentServices {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
  ) {}
  async getAllPayments(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Некоректний ID користувача');
    }
    return await this.purchaseModel
      .find({ userId: id })
      .select(
        'amount status productName rawResponse.processingDate productType createdAt',
      );
  }
  async declinePayment(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Некоректний ID платежа');
    }

    const purchase = await this.purchaseModel.findOne({
      _id: id,
      status: PurchaseStatus.PENDING,
    });
    if (!purchase) {
      throw new NotFoundException(
        'Платіж не знайдено або покупка вже завершена',
      );
    }
    purchase.status = PurchaseStatus.DECLINED;
    const rawResponse = {
      ...purchase.rawResponse,
      processingDate: Math.floor(Date.now() / 1000),
    };
    purchase.rawResponse = rawResponse;
    const result = await purchase.save();
    return result;
  }
}
