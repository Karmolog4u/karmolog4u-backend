import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ContractParticipantDocument = HydratedDocument<ContractParticipant>;

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
export class ContractParticipant {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  })
  courseId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
  })
  contractId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: String,
  })
  fullname: string;

  @Prop({
    required: true,
    type: String,
  })
  idCode: string;

  @Prop({
    required: true,
    type: String,
  })
  passportData: string;

  @Prop({
    required: true,
    type: String,
  })
  phone: string;

  @Prop({
    required: true,
    type: String,
  })
  messenger: string;
}

export const ContractParticipantSchema =
  SchemaFactory.createForClass(ContractParticipant);
