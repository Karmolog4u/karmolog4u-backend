import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type FilesDocument = HydratedDocument<Files>;

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
export class Files {
  @Prop({ required: true, type: String })
  originalName: string;

  @Prop({ required: true, type: String })
  savedName: string;

  @Prop({ required: true, type: String })
  path: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  targetId: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: ['Course', 'Lesson'] })
  targetModel: string;
}

export const FilesSchema = SchemaFactory.createForClass(Files);
