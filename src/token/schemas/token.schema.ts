import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
// import { Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type TokenDocument = HydratedDocument<Token>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    // transform: function (doc, ret) {
    // Remove the "_id" property when the object is serialized
    // delete ret._id;
    // },
  },
})
export class Token {
  @Prop({
    type: String,
    required: [true, 'accessToken is required'],
  })
  accessToken: string;

  @Prop({
    type: String,
    required: [true, 'refreshToken is required'],
  })
  refreshToken: string;

  @Prop({
    type: String,
    required: [true, 'platform is required'],
  })
  platform: string;
  @Prop({
    type: String,
    required: [true, 'platform is required'],
  })
  userAgent: string;
  @Prop({
    type: String,
    required: [true, 'platform is required'],
  })
  ip: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner: User;

  @Prop({ type: Date, default: null, index: { expires: 0 } })
  expiredAt: Date;

  // @Prop({ type: String })
  // updatedAt: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
