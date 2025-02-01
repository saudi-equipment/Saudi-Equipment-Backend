import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OtpContext, OtpType } from 'src/enums';
import { Document } from 'mongoose';

@Schema()
export class Otp extends Document {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true, default: false })
  isUsed: boolean;

  @Prop({ required: true, default: false })
  isExpired: boolean;

  @Prop({ required: true })
  otpExpireTime: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({required: true, enum: OtpContext, default: OtpContext.PHONENUMBERVERIFICATION})
  context: OtpContext;

  @Prop({ required: true, enum: OtpType, default: OtpType.SMS })
  otpType: OtpType;

  @Prop({ required: false })
  ipAddress: string;

  @Prop({ required: false })
  deviceInfo: string;

  @Prop({ required: false, default: 0 })
  resendCount: number;

  @Prop({ required: false, default: false })
  isBlacklisted: boolean;

  @Prop({ required: false })
  generatedDate: Date;

  @Prop({ required: false, default: 0 })
  retryAttempts: number;
}

export const otpSchema = SchemaFactory.createForClass(Otp);
