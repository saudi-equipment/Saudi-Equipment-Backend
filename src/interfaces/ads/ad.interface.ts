import { User } from 'src/schemas/user/user.schema';

export interface IAd {
  id: string;
  category: string;
  fuelType: string;
  condition: string;
  titleAr: string;
  titleEn: string;
  createdBy: string;
  description: string;
  price: string;
  currency: string;
  adId: string;
  year: string;
  city: string;
  isActive: boolean;
  isFeatured: boolean;
  isPromoted: boolean;
  isRenew: boolean;
  youTubeLink: string;
  views: number;
  userId: string;
  isSold?: boolean;
  soldDate?: Date;
  duration?: string;
  paymentType?: string;
  paymentCompany?: string;
  transactionId?: string;
  user?: User;
  promotionPlan?: string;
  promotionStartDate?: Date;
  promotionEndDate?: Date;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}
