import { Types } from 'mongoose';

export interface IContactUs {
  fullName: string;
  phoneNumber: number;
  email: string;
  createdBy: string;
  city: string;
  inquiryType: string;
  attachmentUrls: string;
  subject: string;
  message: string;
  user?: Types.ObjectId | null;
}