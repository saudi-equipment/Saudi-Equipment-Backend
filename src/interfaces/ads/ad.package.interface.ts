import { AdPackage } from "src/schemas/ad";
import { User } from "src/schemas/user/user.schema";

export interface IAdPackage extends AdPackage{
    packageNameAr: string;
    packageNameEn: string;
    description: string;
    price: number;
    currency: string;
    createdBy: string;
    updatedBy: string;
    duration: string;
    discount?: number;
    user?: User;
  }
  