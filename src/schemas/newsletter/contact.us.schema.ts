import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class CantactUs extends Document {
  
  @Prop({ required: true})
  fullName: string;

  @Prop({ required: true})
  phoneNumber: number;

  @Prop({ required: true})
  email: string;

  @Prop({ required: false})
  createdBy: string;

  @Prop({ required: true})
  city: string;

  @Prop({ required: true})
  inquiryType: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true})
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  user: User;
}

export const contactUsSchema = SchemaFactory.createForClass(CantactUs);
