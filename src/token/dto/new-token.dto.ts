import { Types } from 'mongoose';

export class NewTokenDto {
  accessToken: string;
  refreshToken: string;
  platform: string;
  userAgent: string;
  ip: string;
  owner: Types.ObjectId;
  expiredAt: Date;
}
