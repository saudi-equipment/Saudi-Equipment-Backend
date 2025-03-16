import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from 'src/enums';
import { Ad } from '../ad/ad.schema';
import { Subscription } from '../subscription/subscription.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: false })
  name?: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  updatedBy?: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  city: string;
  
  @Prop({ required: false, default: null})
  profilePicture?: string;

  @Prop({ required: false, enum: UserRole, default: UserRole.USER })
  role: UserRole;
  
  @Prop({ required: false, default: false })
  isVerified?: boolean;

  @Prop({ required: false, default: true })
  isActive?: boolean;

  @Prop({ required: false, default: false })
  isEmailVerified?: boolean;

  @Prop({ required: false, default: false })
  isDeleted?: boolean;

  @Prop({ required: false, default: false })
  isBlocked?: boolean;

  @Prop({ required: false, default: false })
  isPremiumUser?: boolean;

  @Prop({ required: false })
  metaLink?: string;
  
  @Prop({ required: false })
  xLink?: string;

  @Prop({ required: false })
  whatsAppLink?: string;

  @Prop({ required: false })
  instaLink?: string;

  @Prop({ required: false })
  createdDate?: Date;

  @Prop({ required: false })
  updatedDate?: Date;

  @Prop({ type: [Types.ObjectId], ref: 'Ad', required: false })
  ads?: Ad[];

  @Prop({ type: [Types.ObjectId], ref: 'Subscription', required: false })
  subscriptions?: Subscription[];
}

export const userSchema = SchemaFactory.createForClass(User);
