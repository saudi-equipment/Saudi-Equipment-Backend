import { User } from "aws-sdk/clients/budgets";

export interface IAd {
  id: string,
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
  user?: User, 
  images: string[];
  createdAt: Date,
  updatedAt: Date
}
