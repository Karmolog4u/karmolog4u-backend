import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

export enum PurchaseStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentType {
  FULL = 'FULL',
  MONTHLY = 'MONTHLY',
}

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ required: true, unique: true })
  orderReference: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'EUR' })
  currency: string;

  @Prop({ type: String })
  productName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  productId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String })
  productType: string;

  @Prop({ type: Number })
  productPrice: number;

  @Prop({ enum: PaymentType })
  paymentType: PaymentType;

  @Prop()
  clientEmail: string;

  @Prop()
  clientPhone: string;

  @Prop({ enum: PurchaseStatus, default: PurchaseStatus.PENDING })
  status: PurchaseStatus;

  @Prop()
  transactionStatus: string;

  @Prop()
  wayforpayOrderId: string;

  @Prop()
  processed: boolean; // idempotency

  @Prop({ type: Object })
  rawResponse: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  userId: mongoose.Schema.Types.ObjectId;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

PurchaseSchema.index({ orderReference: 1 }, { unique: true });
