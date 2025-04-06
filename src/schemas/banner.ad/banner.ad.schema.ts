import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class BannerAd extends Document {
  @Prop({ required: true })
  bannerAdName: string;

  @Prop({ type: String, required: true })
  bannerImage: string;

  @Prop({ required: true })
  bannerAdLink: string;

  @Prop({ required: false })
  bannerAdId: string;

  @Prop({ required: false })
  createdBy: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User;
}

export const bannerAdSchema = SchemaFactory.createForClass(BannerAd);
