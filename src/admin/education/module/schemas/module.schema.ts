import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ModuleDocument = HydratedDocument<Module>;

@Schema({ _id: false })
class Access {
  @Prop({ type: Date, required: true })
  dateStart: Date;

  @Prop({ type: Date, required: true })
  dateEnd: Date;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      ret.id = ret._id?.toString(); // створює поле id з _id
      delete ret._id; // видаляє _id
    },
  },
})
export class Module {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({
    required: true,
    type: String,
    enum: ['PRACTICAL', 'THEORETICAL'],
  })
  type: string;

  @Prop({
    required: true,
    type: Access,
  })
  access: Access;

  @Prop({ required: true, type: String })
  durationInDays: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  course: mongoose.Types.ObjectId;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
