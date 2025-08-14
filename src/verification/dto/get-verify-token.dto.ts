import { Types } from 'mongoose';

export class GetVerifyToken {
  userId: Types.ObjectId;
  email: string;
}
