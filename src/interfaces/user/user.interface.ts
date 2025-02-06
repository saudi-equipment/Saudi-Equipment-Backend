import { bool } from 'aws-sdk/clients/signer';
import { UserRole } from 'src/enums';
import { Ad } from 'src/schemas/ad/ad.schema';

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
  isDeleted?: boolean;
  isBlocked?: boolean;
  isPremiumUser?: boolean;
  otpId?: string,
  ads?: Ad[]
  
}
