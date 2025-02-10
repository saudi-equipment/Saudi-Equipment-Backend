import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ required: false, default: null })
  transactionId: string;

  @Prop({ required: false, default: null })
  subscriptionName: string;
  
  @Prop({ required: false, default: null })
  subscribedBy: string;

  @Prop({ required: false, default: null })
  createdBy: string;

  @Prop({ required: false, default: null })
  paymentType: string;

  @Prop({ required: false, default: null })
  paymentCompany: string;
  
  @Prop({ required: false, default: null })
  plan: string;

  @Prop({ required: false, default: null })
  currency: string;

  @Prop({ required: false, default: null })
  duration: string;

  @Prop({ required: false, default: null })
  description: string;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  subscriptionStatus: string;  

  @Prop({ required: false, default: null })
  price: number;

  @Prop({ required: false, default: null })
  startDate: Date;

  @Prop({ required: false, default: null })
  endDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  user: User;
}

export const subscriptionSchema = SchemaFactory.createForClass(Subscription);

