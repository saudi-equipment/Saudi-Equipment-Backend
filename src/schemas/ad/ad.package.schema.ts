import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
@Schema({ timestamps: true })
export class AdPackage extends Document {
 
  @Prop({ required: true })
  packageNameAr: string;

  @Prop({ required: true })
  packageNameEn: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: false })
  updatedBy?: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: false })
  discount?: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user?: User;
  
}

export const adsPackageSchema = SchemaFactory.createForClass(AdPackage);
