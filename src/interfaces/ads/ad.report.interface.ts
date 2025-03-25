import { User } from 'src/schemas/user/user.schema';
import { Ad } from 'src/schemas/ad/ad.schema';

export interface IReportAd {
  reportedBy: string;
  subject: string;
  message: string;
  user: User;
  ad: Ad;
}
