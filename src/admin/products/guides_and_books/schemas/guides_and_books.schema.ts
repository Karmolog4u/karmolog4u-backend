import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type GuidesAndBooksDocument = HydratedDocument<GuidesAndBooks>;

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

export enum CategoryGuidesAndBooks {
  GUIDES = 'GUIDES',
  OTHER_GUIDES = 'OTHER_GUIDES',
  BOOKS = 'BOOKS',
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
export class GuidesAndBooks {
  @Prop({
    type: String,
    enum: ['GUIDES', 'OTHER_GUIDES', 'BOOKS'],
    required: [true, 'Category is required'],
  })
  category: CategoryGuidesAndBooks;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  name: Name;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  description: Description;

  @Prop({ type: String, default: '' })
  video: string;

  @Prop({ type: String, default: '' })
  cover: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Files',
  })
  file: string;

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

export const GuidesAndBooksSchema =
  SchemaFactory.createForClass(GuidesAndBooks);
