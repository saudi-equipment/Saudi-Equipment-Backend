import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Ad } from '../ad/ad.schema';

@Schema()
export class Image extends Document {
  @Prop({ type: [String] })
  imageUrls: string[];

  @Prop({ default: 0, required: false })
  sequence: number;

  @Prop({ required: true })
  adId: string;

  @Prop({ type: Types.ObjectId, ref: 'Ad', required: false })
  ad: Ad ;
}
