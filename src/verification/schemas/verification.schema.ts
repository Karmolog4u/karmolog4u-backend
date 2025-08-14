import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
// import { Role } from 'src/role/role.enum';

export type VerificationDocument = HydratedDocument<Verification>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    // transform: function (doc, ret) {
    //   // Remove the "_id" property when the object is serialized
    // },
  },
})
export class Verification {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'user id is required'],
    unique: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: String, required: [true, 'verify token is required'] })
  token: string;

  @Prop({ type: String, required: [true, 'Email is required'], unique: true })
  email: string;
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);
