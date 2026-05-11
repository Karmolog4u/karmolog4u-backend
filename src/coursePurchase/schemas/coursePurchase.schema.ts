import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CoursePurchaseDocument = HydratedDocument<CoursePurchase>;

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
export class CoursePurchase {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  })
  courseId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: ['PERMANENT', 'FOR_PERIOD', 'TO_DATE'],
  })
  accessType: string;

  @Prop({ type: Date, required: false, default: null })
  accessStartDate: Date; // дата початку доступу (від або дата покупки)

  @Prop({ type: Date, required: false, default: null })
  accessEndDate: Date; // якщо є (для типів PERIOD або RANGE)

  @Prop({
    required: true,
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'BLOCKED'],
  })
  status: string;

  @Prop({
    required: true,
    type: String,
    enum: ['FULL', 'PARTIAL', 'INSTALLMENT'],
  })
  paymentPlan: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    default: [],
  })
  //ssk 50%
  lessonsUnlocked: mongoose.Types.ObjectId[];

  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  completed: false; //default

  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  agreement: false;

  //кількість практик
  @Prop({
    required: false,
    type: Number,
    default: 0,
  })
  //for counsalting & advansed
  numberOfPractices: number;

  //доступ до дати
  @Prop({
    required: false,
    type: Date,
    default: null,
  })
  availableTo: Date;

  // ціна для курсу, референс для оплати
  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  courseAmount: number;

  // ціна для практики, референс для оплати
  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  practiceAmount: number;

  //кількість виконаних платежів
  @Prop({
    required: false,
    type: Number,
    default: 0,
  })
  numberOfPayments: number;
}

export const CoursePurchaseSchema =
  SchemaFactory.createForClass(CoursePurchase);
