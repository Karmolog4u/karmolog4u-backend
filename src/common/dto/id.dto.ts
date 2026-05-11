import { Types } from 'mongoose';

export class IdDto {
  toHexString(): any {
    throw new Error('Method not implemented.');
  }
  _id: Types.ObjectId;
}
