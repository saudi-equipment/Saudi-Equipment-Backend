import { Types, Document } from 'mongoose';
import { Subscription } from 'rxjs';
import { AdPromotion } from 'src/schemas/ad/ad.promotion.schema';
import { User } from 'src/schemas/user/user.schema';

export interface IPaymentTransaction extends Document {
    transactionId?: string;
    subscriptionId?: string;
    adPromotionId?: string;
    paymentType?: string;
    paymentCompany?: string;
    currency?: string;
    price?: number;
    status: boolean;
    subscription?: Types.ObjectId | Subscription;
    user?: Types.ObjectId | User;
    adPromotion?: Types.ObjectId | AdPromotion;
    createdAt?: Date;
    updatedAt?: Date;
}
