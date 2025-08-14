import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GiftDocument = HydratedDocument<Gift>;

export class Name {
  ru: string;
  uk: string;
}

export class Description {
  ru: string;
  uk: string;
}

export enum Status {
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  DRAFT = 'DRAFT',
}

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
export class Gift {
  @Prop({ type: Object, default: { ru: '', uk: '' } })
  name: Name;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  description: Description;

  @Prop({ type: String, default: '' })
  cover: string;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: Boolean, default: false })
  isWaiting: boolean;

  @Prop({ type: Boolean, default: false })
  toDelete: boolean;

  @Prop({
    type: String,
    enum: ['PUBLISHED', 'HIDDEN', 'DRAFT'],
    default: 'DRAFT',
    required: [true, 'Status is required'],
  })
  status: Status;

  @Prop({ type: Date, default: null, index: { expires: 0 } })
  expiredAt: Date;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);
