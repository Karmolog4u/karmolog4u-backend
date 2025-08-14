import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ _id: false })
class Access {
  @Prop({
    required: true,
    type: String,
    enum: ['PERMANENT', 'FOR_PERIOD', 'TO_DATE'],
  })
  type: string;

  @Prop({ type: Date })
  dateStart: Date;

  @Prop({ type: Date })
  dateEnd: Date;

  @Prop({ type: Number, required: false })
  months: number;
}

@Schema({ _id: false })
export class AdditionalLink {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  link: string;
}

@Schema({ _id: false })
export class VideoLink {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
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
export class Lesson {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  targetId: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: ['Course', 'Module'] })
  targetModel: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '' })
  internalDescription: string;

  @Prop({ required: false, type: Access })
  access: Access;

  @Prop({ type: [VideoLink], default: [] })
  videoLinks: VideoLink[];

  @Prop({ type: [AdditionalLink], default: [] })
  additionalLinks: AdditionalLink[];

  @Prop({ type: String, default: '' })
  recommendations: string;

  @Prop({ type: String, default: '' })
  homework: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Files' }],
    default: [],
  })
  homeworkFiles: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Files' }],
    default: [],
  })
  bonusFiles: mongoose.Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  feedbacks: string[];

  @Prop({ type: Number, default: null })
  moduleDay: number;

  @Prop({ type: Number, default: null })
  modulePart: number;

  @Prop({ type: Date, default: null })
  lessonTimeStart: Date;

  @Prop({ type: Date, default: null })
  lessonTimeEnd: Date;

  @Prop({
    type: String,
    default: 'DRAFT',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
  })
  status: string;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
