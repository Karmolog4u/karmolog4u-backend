import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProductPurchaseDocument = HydratedDocument<ProductPurchase>;

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
export class ProductPurchase {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  })
  productId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: ['Webinar', 'Meditation', 'GuidesAndBooks'],
  })
  targetModule: 'Webinar' | 'Meditation' | 'GuidesAndBooks';
}

export const ProductPurchaseSchema =
  SchemaFactory.createForClass(ProductPurchase);
