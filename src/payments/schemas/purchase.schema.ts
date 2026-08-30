import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

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

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      // Remove the "_id" property when the object is serialized
      ret.id = ret._id.toString(); // Add an "id" property with the value of "_id"
      delete ret._id;
      return ret;
    },
  },
})
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
  productId: Types.ObjectId;

  @Prop({ type: String })
  productType: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String, default: null })
  promocode: string | null;

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
  wayforpayOrderId: string;

  @Prop()
  processed: boolean; // idempotency

  @Prop({ type: Object })
  rawResponse: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId;

  @Prop({
    type: Date,
    expires: 0,
    default: () => new Date(Date.now() + 5 * 60 * 60 * 1000),
  })
  expiresAt?: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

PurchaseSchema.index({ orderReference: 1 }, { unique: true });
