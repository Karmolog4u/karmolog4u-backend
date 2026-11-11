import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
export enum Status {
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  DRAFT = 'DRAFT',
}

export enum CategoryWebinar {
  WEBINARS = 'WEBINARS',
  ETHERS = 'ETHERS',
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
export class Webinar {
  @Prop({
    type: String,
    enum: ['WEBINARS', 'ETHERS'],
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
    enum: ['PUBLISHED', 'HIDDEN', 'DRAFT'],
    default: 'DRAFT',
    required: [true, 'Status is required'],
  })
  status: Status;

  @Prop({ type: Date, default: null, index: { expires: 0 } })
  expiredAt: Date;
}

export const WebinarSchema = SchemaFactory.createForClass(Webinar);
