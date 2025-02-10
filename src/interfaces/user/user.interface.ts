
import { UserRole } from 'src/enums';
import { Ad } from 'src/schemas/ad/ad.schema';
import { Subscription } from 'src/schemas/subscription/subscription.schema';

export interface IUser extends Document {
  id:string,
  name: string;
  password: string;
  email: string;
  phoneNumber: string;
  city: string;
  profilePicture?: string;
  role: UserRole;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  isBlocked?: boolean;
  isPremiumUser?: boolean;
  subscriptions?: Subscription,
  otpId?: string,
  ads?: Ad[]
  
}
