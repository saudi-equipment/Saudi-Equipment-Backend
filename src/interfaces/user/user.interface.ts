import { UserRole } from 'src/enums';
import { Ad } from 'src/schemas/ad/ad.schema';
import { Subscription } from 'src/schemas/subscription/subscription.schema';
import { User } from 'src/schemas/user/user.schema';

export interface IUser extends User {
  id?: string;
  name?: string;
  password?: string;
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
  metaLink?: string;
  xLink?: string;
  whatsAppLink?: string;
  instaLink?: string;
  isPremiumUser?: boolean;
  subscription?: Subscription;
  otpId?: string;
  ads?: Ad[];
}
