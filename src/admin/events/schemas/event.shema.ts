import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      // Remove the "_id" property when the object is serialized
      ret.id = ret._id.toString(); // Add an "id" property with the value of "_id"
      delete ret._id;
      return ret;
    },
  },
})
export class Event {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Date })
  dateStart: Date;

  @Prop({ required: true, type: Date })
  dateEnd: Date;

  @Prop({ type: String, default: '' })
  cover: string;

  @Prop({ type: String, default: '' })
  eventLink: string;

  @Prop({ type: String, enum: ['PUBLISHED', 'DRAFT'] })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
