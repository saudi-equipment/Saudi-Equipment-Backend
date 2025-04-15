import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from '../user/user.schema';
import { Ad } from './ad.schema';

@Schema({timestamps: true})
export class ReportAd extends Document {
  @Prop({ required: true })
  reportedBy: string;

  @Prop({ required: true })
  reportType: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  adId: string;

  @Prop({ type: Types.ObjectId, ref: 'Ad', required: false })
  ad: Ad;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User;
}

export const reportAdSchema = SchemaFactory.createForClass(ReportAd);
