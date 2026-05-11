import { Types } from 'mongoose';

export interface UpdatePurchaseAccess {
  paymentPlan?: 'FULL' | 'PARTIAL';
  lessonsUnlocked?: Types.ObjectId[];
  availableTo?: Date;
}
