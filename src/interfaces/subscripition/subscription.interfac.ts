import { Types } from 'mongoose';
import { User } from 'src/schemas/user/user.schema';

export interface ISubscription {
  _id?: Types.ObjectId;
  transactionId?: string | null;
  subscriptionName?: string | null;
  subscribedBy?: string | null;
  createdBy?: string | null;
  paymentType?: string | null;
  paymentCompany?: string | null;
  plan?: string | null;
  currency?: string | null;
  duration?: string | null;
  description?: string | null;
  subscriptionStatus?: 'active' | 'inactive';
  price?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  user?: Types.ObjectId | User | null;
  createdAt?: Date;
  updatedAt?: Date;
}
