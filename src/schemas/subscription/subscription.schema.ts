import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: false })
  subscriptionName: string;
  
  @Prop({ required: false })
  subscribedBy: string;

  @Prop({ required: false })
  paymentType: string;

  @Prop({ required: false })
  paymentCompany: string;
  
  @Prop({ required: false })
  plan: string;

  @Prop({ required: false })
  duration: string;

  @Prop({ required: false })
  description: string;

  @Prop({ type: String, enum: ['active', 'inactive'] })
  subscriptionStatus: string;  

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User;

}

export const subscriptionSchema = SchemaFactory.createForClass(Subscription);
