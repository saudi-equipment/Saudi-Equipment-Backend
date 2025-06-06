import { UserRole } from 'src/enums';
import {Types} from 'mongoose'
import { Ad } from 'src/schemas/ad/ad.schema';
import { Subscription } from 'src/schemas/subscription/subscription.schema';
import { User } from 'src/schemas/user/user.schema';
import { PaymentTransaction } from 'src/schemas/payment.transaction/payment.transaction.schema';
import { AdPromotion } from 'src/schemas/ad/ad.promotion.schema';

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
  otpId?: string;
  blockedUsers?: Types.ObjectId[];
  ads?: Ad[];
  subscription?: Subscription[];
  paymentTransactions?: PaymentTransaction[];
  adPromotions?: AdPromotion[];
}