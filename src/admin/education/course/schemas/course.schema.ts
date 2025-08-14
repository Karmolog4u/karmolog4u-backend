import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ _id: false })
class Access {
  @Prop({
    required: true,
    type: String,
    enum: ['PERMANENT', 'FOR_PERIOD', 'TO_DATE'],
  })
  type: string;

  @Prop({ type: Date, required: false })
  dateStart: Date;

  @Prop({ type: Date, required: false })
  dateEnd: Date;

  @Prop({ type: Number, required: false })
  months: number;
}

@Schema({ _id: false })
class Literature {
  @Prop({ required: true, type: String })
  author: string;

  @Prop({ required: true, type: String })
  link: string;
}

@Schema({ _id: false })
class OptionalLink {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  link: string;
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
export class Course {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({
    required: true,
    type: String,
    enum: [
      'SSK_INDEPENDENT',
      'SSK_WITH_CURATOR',
      'SSK_WITH_SERGIY',
      'ADVANCED',
      'CONSULTING',
    ],
  })
  type: string;

  @Prop({ required: true, type: String, enum: ['ALL', 'BY_LESSON'] })
  completeness: string;

  @Prop({
    type: Access,
    required: true,
  })
  access: Access;

  @Prop({ required: false, type: String, default: '' })
  chat: string;

  @Prop({
    required: false,
    type: [OptionalLink],
    default: [],
  })
  optionalLink: OptionalLink[];

  @Prop({ required: false, type: String, default: '' })
  practiceInvoice: string;

  @Prop({ required: false, type: String, default: 0 })
  stream: number;

  @Prop({ required: false, type: Number, default: 0 })
  price: number;

  @Prop({
    required: false,
    type: [Literature],
    default: [],
  })
  literature: Literature[];

  @Prop({ required: false, type: String, default: '' })
  cover: string;

  @Prop({
    required: true,
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
  })
  status: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
