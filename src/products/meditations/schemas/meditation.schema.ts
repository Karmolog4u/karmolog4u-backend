import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PUBLISHED, DRAFT, HIDDEN } from 'src/common/helper/consts';
import { ARCANES, CLOSED_MEDITATIONS, OPENED_MEDITATIONS } from 'src/common/helper/consts';
// import * as mongoose from 'mongoose';

export type MeditationDocument = HydratedDocument<Meditation>;

export class Name {
  ru: string;
  uk: string;
}

export class Description {
  ru: string;
  uk: string;
}

export class MeditationVideo {
  video: string;
  playlist: string;
}

export const Status = {
  PUBLISHED,
  HIDDEN,
  DRAFT,
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const Category = {
  OPENED: OPENED_MEDITATIONS,
  CLOSED: CLOSED_MEDITATIONS,
  ARCANES,
} as const;

export type Category = (typeof Category)[keyof typeof Category];

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
export class Meditation {
  @Prop({
    type: String,
    enum: Object.values(Category),
    required: [true, 'Category is required'],
  })
  category: Category;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  name: Name;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  description: Description;

  @Prop({ type: Object, default: { video: '', playlist: '' } })
  video: MeditationVideo;

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
    enum: Object.values(Status),
    default: Status.DRAFT,
    required: [true, 'Status is required'],
  })
  status: Status;

  @Prop({ type: Date, default: null, index: { expires: 0 } })
  expiredAt: Date;
}

export const MeditationSchema = SchemaFactory.createForClass(Meditation);
