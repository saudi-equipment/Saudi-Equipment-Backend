import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { AdPromotion } from './ad.promotion.schema';
@Schema({ timestamps: true })
export class Ad extends Document {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  fuelType: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  condition: string;

  @Prop({ required: true })
  titleAr: string;

  @Prop({ required: true })
  titleEn: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: false })
  adId: string;

  @Prop({ required: true })
  year: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: false })
  duration: string;

  @Prop({ required: true, default: false })
  isPromoted: boolean;

  @Prop({ required: true, default: false })
  isRenew: boolean;

  @Prop({ required: false })
  youTubeLink: string;

  @Prop({ required: false, default: false })
  isSold: boolean;

  @Prop({ required: false })
  soldDate: Date;

  @Prop({ required: true, default: 0 })
  views: number;

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'AdPromotion', required: false })
  adPromotion: AdPromotion;

  @Prop({ required: false, unique: true, sparse: true })
  slug: string;

  @Prop({ type: [String], required: false })
  oldImages: string[];
}

export const adsSchema = SchemaFactory.createForClass(Ad);
