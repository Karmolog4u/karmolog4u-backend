import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/role/role.enum';
import * as bcrypt from 'bcryptjs';
import { UpdateQuery } from 'mongoose';
export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      // Remove the "_id" property when the object is serialized
      delete ret._id;
      delete ret.password;
    },
  },
})
export class User {
  @Prop({
    type: String,
    required: [true, 'name is required'],
  })
  name: string;

  @Prop({ type: String, required: [true, 'Last name is required'] })
  lastName: string;

  @Prop({ type: String, required: false, default: null })
  mobPhone: string;

  @Prop({ type: String, required: [true, 'Password is required'] })
  password: string;

  @Prop({ type: String, required: [true, 'Email is required'], unique: true })
  email: string;

  @Prop({ type: Array, enum: ['ADMIN', 'USER'], default: 'USER' })
  role: Role[];

  @Prop({ type: Boolean, default: false })
  banned: boolean;

  @Prop({ type: Boolean, default: false })
  toDelete: boolean;

  @Prop({ type: Boolean, default: false })
  verified: boolean;

  @Prop({ type: Date, default: null })
  lastLogin: Date;

  @Prop({ type: Date, default: null })
  expiredAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (!update) return next();

  // Якщо update виглядає як об'єкт { password: '...' }
  if ('$set' in update && update.$set?.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  } else if ('password' in update) {
    // Прямий update.password
    (update as UpdateQuery<UserDocument>).password = await bcrypt.hash(
      (update as UpdateQuery<UserDocument>).password!,
      10,
    );
  }

  next();
});
