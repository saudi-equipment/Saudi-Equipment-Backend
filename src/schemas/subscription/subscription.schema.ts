import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { SubscriptionPlan } from './subscription.plan.schema';
@Schema({ timestamps: true })
export class Subscription extends Document {
  
  @Prop({ required: false })
  subscriptionName: string;

  @Prop({ required: false })
  subscribedBy: string;

  @Prop({ required: false })
  createdBy: string;

  @Prop({ required: false })
  subscriptionPlanId: string;

  @Prop({ required: false })
  plan: string;

  @Prop({ required: false })
  currency: string;

  @Prop({ required: false })
  duration: string;

  @Prop({ required: false })
  description: string;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'inactive' })
  subscriptionStatus: string;

  @Prop({ required: false })
  price: number;

  @Prop({ required: false })
  startDate: Date;

  @Prop({ required: false })
  endDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan', required: false })
  subscriptionPlan: SubscriptionPlan;
}

export const subscriptionSchema = SchemaFactory.createForClass(Subscription);
