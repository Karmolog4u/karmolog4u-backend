import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  WEBINARS,
  ETHERS,
  TRAINING,
  PUBLISHED,
  HIDDEN,
  DRAFT,
} from 'src/common/helper/consts';

export type WebinarDocument = HydratedDocument<Webinar>;

export class Name {
  ru: string;
  uk: string;
}

export class Description {
  ru: string;
  uk: string;
}

export class DetailsTitle {
  ru: string;
  uk: string;
}

export class DetailsDescription {
  ru: string;
  uk: string;
}

export class WebinarVideo {
  video: string;
  playlist: string;
}
export const Status = {
  PUBLISHED,
  HIDDEN,
  DRAFT,
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const CategoryWebinar = {
  WEBINARS,
  ETHERS,
  TRAINING,
} as const;

export type CategoryWebinar =
  (typeof CategoryWebinar)[keyof typeof CategoryWebinar];

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
export class Webinar {
  @Prop({
    type: String,
    enum: Object.values(CategoryWebinar),
    required: [true, 'Category is required'],
  })
  category: CategoryWebinar;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  name: Name;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  description: Description;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  detailsTitle: DetailsTitle;

  @Prop({ type: Object, default: { ru: '', uk: '' } })
  detailsDescription: DetailsDescription;

  @Prop({ type: Object, default: { video: '', playlist: '' } })
  video: WebinarVideo;

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

export const WebinarSchema = SchemaFactory.createForClass(Webinar);
