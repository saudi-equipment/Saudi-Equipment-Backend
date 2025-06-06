import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { Subscription } from "../subscription/subscription.schema";
import { User } from "../user/user.schema";
import { AdPromotion } from "../ad/ad.promotion.schema";

@Schema({ timestamps: true })
export class PaymentTransaction {
  @Prop({ required: false })
  adpromotionId: string;

  @Prop({ required: false })
  subscriptionId: string;

  @Prop({ required: true })
  paymentType: string;
  
  @Prop({ required: true })
  paymentCompany: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: false })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: false })
  subscription: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'AdPromotion', required: false })
  adPromotion:  AdPromotion;
}

export const paymentTransactionSchema = SchemaFactory.createForClass(PaymentTransaction);
