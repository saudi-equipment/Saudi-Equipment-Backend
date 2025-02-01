import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
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

  @Prop({ required: true, default: true})
  isActive: boolean;

  @Prop({ required: true, default: false})
  isPromoted: boolean;

  @Prop({ required: true, default: false})
  isRenew: boolean;
  
  @Prop({ required: true })
  youTubeLink: string;

  @Prop({ required: true, default: 0 })
  views: number;

  @Prop({ type: [String], required: true})
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User;
  
}

export const adsSchema = SchemaFactory.createForClass(Ad);
