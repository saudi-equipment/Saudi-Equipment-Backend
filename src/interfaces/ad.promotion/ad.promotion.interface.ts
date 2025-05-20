
import { Types } from 'mongoose';
import { Ad } from 'src/schemas/ad/ad.schema';
import { User } from 'src/schemas/user/user.schema';

export interface IAdPromotion {
    adId: string;
    promotionPrice: string;
    currency: string;
    promotionPlan: '7days' | '15days' | '30days';
    promotionStartDate: Date;
    promotionEndDate: Date;
    promotedBy: string;
    user: Types.ObjectId | User;
    ad: Types.ObjectId | Ad;
    createdAt?: Date;
    updatedAt?: Date;
}
