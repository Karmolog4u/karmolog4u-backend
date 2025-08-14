import { Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export class TokenEntity {
  /**
 id
  @example "9092384823"
  */
  _id: Types.ObjectId;

  /**
  owner 
  @example "John"
  */
  owner: User;

  /**
  User's accessToken
  @example "example@mail.com"
  */
  accessToken: string;

  /**
  User's accessToken
  @example "example@mail.com"
  */

  platform: string;

  /**
  User's accessToken
  @example "example@mail.com"
  */
  userAgent: string;

  /**
  User's accessToken
  @example "example@mail.com"
  */
  ip: string;

  /**
  User's refreshToken
  @example "322352rwer"
  */
  refreshToken: string;

  /**
  Indicates if the user is banned
  @example 'created date'
  */
  expiredAt: Date;

  /**
  Indicates if the user is banned
  @example 'created date'
  */
  createdAt?: Date;

  /**
  Indicates if the user is banned
  @example 'updated date'
  */
  updatedAt?: Date;
}
