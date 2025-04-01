import { User } from '../../schemas/user/user.schema';

export interface ISubscription {
  _id: string;
  transactionId?: string;
  subscriptionName?: string;
  subscribedBy?: string;
  plan: string;
  duration?: string;
  status?: 'active' | 'inactive';
  price: number;
  user?: User;
  startDate: Date,
  endDate: Date,
  createdAt: string;
  updatedAt: string;
}
