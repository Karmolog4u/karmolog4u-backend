import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class IdParams {
  @IsMongoId()
  id: Types.ObjectId;
}
