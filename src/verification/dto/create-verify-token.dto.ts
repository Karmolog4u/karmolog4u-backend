import { Types } from 'mongoose';

export class CreateVerifyToken {
  userId: Types.ObjectId;
  token: string;
  email: string;
}
