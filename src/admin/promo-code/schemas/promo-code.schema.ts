import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PromoCodeDocument = HydratedDocument<PromoCode>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      // Remove the "_id" property when the object is serialized
      delete ret._id;
    },
  },
})
export class PromoCode {
  @Prop({ type: String, unique: true, required: true })
  name: string;

  @Prop({ type: Number, default: 0, required: true })
  promoDiscount: number;

  @Prop({ type: Date, default: Date.now, required: true })
  start: Date;

  @Prop({ type: Date, default: null })
  end: Date;

  @Prop({ type: Boolean, default: false })
  blocked: boolean;

  @Prop({ type: Number, default: 0 })
  usedCounter: number;

  @Prop({ type: String, default: 0 })
  productName: string;

  @Prop({ type: String, default: 0 })
  collectionName: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'collectionName',
    required: true,
  })
  refId: mongoose.Types.ObjectId;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);
