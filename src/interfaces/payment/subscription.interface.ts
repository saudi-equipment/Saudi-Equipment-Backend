import { User } from '../../schemas/user/user.schema';

export interface ISubscription {
  transactionId: string;
  subscriptionName?: string;
  subscribedBy?: string;
  plan?: string;
  duration?: string;
  status: 'active' | 'inactive';
  price: number;
  user?: User;
  created_at: Date;
  updated_at: Date
}
