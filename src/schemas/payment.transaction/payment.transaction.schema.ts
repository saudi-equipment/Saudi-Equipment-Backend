import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { Subscription } from "../subscription/subscription.schema";
import { User } from "../user/user.schema";
import { AdPromotion } from "../ad/ad.promotion.schema";

@Schema({ timestamps: true })
export class PaymentTransaction {
  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
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

  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: true })
  subscription: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AdPromotion', required: false })
  adPromotion: AdPromotion;
}

export const paymentTransactionSchema = SchemaFactory.createForClass(PaymentTransaction);
