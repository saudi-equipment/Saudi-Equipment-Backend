import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from 'src/enums';
import { Ad } from '../ad/ad.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  updatedBy: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  city: string;

  
  // @Prop({ required: true })
  // city: string;
  
  // @Prop({ required: true })
  // city: string;
  
  // @Prop({ required: true })
  // city: string;

  @Prop({ required: false })
  profilePicture: string;

  @Prop({ required: false, enum: UserRole, default: UserRole.USER })
  role: UserRole;
  
  @Prop({ required: false, default: false })
  isVerified: boolean;

  @Prop({ required: false, default: false })
  isDeleted: boolean;

  @Prop({ required: false, default: false })
  isBlocked: boolean;

  @Prop({ required: false, default: false })
  isPremiumUser: boolean;

  @Prop({ required: false })
  createdDate: Date;

  @Prop({ required: false })
  updatedDate: Date;

  @Prop({ type: [Types.ObjectId], ref: 'Ad', required: false })
  ads: Ad[];
}

export const userSchema = SchemaFactory.createForClass(User);
