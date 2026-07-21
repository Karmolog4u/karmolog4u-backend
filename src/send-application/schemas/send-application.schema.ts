import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AssociationApplicationDocument =
  HydratedDocument<AssociationApplication>;

export enum AssociationApplicationStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({
  timestamps: true,
})
export class AssociationApplication {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  nameEng: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, trim: true })
  socLink: string;

  @Prop({ required: true })
  education: string;

  @Prop({ required: true })
  educationInStudio: string;

  @Prop({ required: true })
  courses: string;

  @Prop({ required: true })
  graduateSchool: string;

  @Prop({ required: true })
  work: string;

  @Prop({ required: true })
  interesting: string;

  @Prop({ required: true })
  otherMemberships: string;

  @Prop({ required: true })
  motivation: string;

  @Prop({
    type: String,
    enum: AssociationApplicationStatus,
    default: AssociationApplicationStatus.NEW,
    index: true,
  })
  status: AssociationApplicationStatus;

  @Prop({
    default: false,
  })
  adminEmailSent: boolean;

  @Prop({
    default: false,
  })
  userEmailSent: boolean;
  @Prop({ trim: true })
  comment: string;
}

export const AssociationApplicationSchema = SchemaFactory.createForClass(
  AssociationApplication,
);
