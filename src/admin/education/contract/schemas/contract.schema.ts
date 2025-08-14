import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, HydratedDocument } from 'mongoose';

export type ContractDocument = HydratedDocument<Contract>;

@Schema({ _id: false })
export class Point {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  description: string;
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
export class Contract {
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  })
  course: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Date, required: true })
  signUpTo: Date;

  @Prop({ type: Number, required: false })
  price: number;

  @Prop({ type: String, required: true })
  header: string;

  @Prop({ required: false, type: [Point], default: [] })
  points: Point[];
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
