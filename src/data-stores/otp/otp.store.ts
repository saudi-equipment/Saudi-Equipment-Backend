import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResetPasswordDto } from 'src/auth/dtos';
import { IOtp } from 'src/interfaces/otp/otp.interface';

@Injectable()
export class OtpStore {
  constructor(@InjectModel('Otp') private otpModel: Model<IOtp>) {}

  async findOtpById(id: string): Promise<IOtp | null> {
    return await this.otpModel.findById({_id: id });
  }

  async findExitingOtpByPhoneNumber(phoneNumber: string): Promise<IOtp> {
    return await this.otpModel.findOne({ phoneNumber: phoneNumber });
  }

  async findExistingOtpByEmail(email: string): Promise<IOtp> {
    return await this.otpModel.findOne({ email: email });
  }

  async update(id: string, code: string): Promise<void> {
    await this.otpModel.updateOne(
      { _id: id },
      {
        code: code,
        isUsed: true,
        isExpired: true,
      },
    );
  }

  async deleteOtp(id: string): Promise<void>{
    await this.otpModel.deleteOne({ _id: id });
  }

  async updateOtp(
    otpCode: string,
    otpExpireTime: string,
    id: string,
  ): Promise<IOtp> {
    try {
      const updateOtp = await this.otpModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        {
          code: otpCode,
          otpExpireTime: otpExpireTime,
          isUsed: false,
          isExpired: false,
        },
        { new: true },
      );

      if (!updateOtp) {
        throw new Error('OTP not found');
      }

      return updateOtp;
    } catch (error) {
      throw error;
    }
  }

  async createOtp(
    code: string,
    otpExpireTime: string,
    phoneNumber: string,
    email?: string
  ): Promise<IOtp | null> {
    const otp = new this.otpModel({
      code: code,
      isUsed: false,
      isExpired: false,
      otpExpireTime: otpExpireTime,
      phoneNumber: phoneNumber,
      email: email
    });
    console.log("Created Otp.............................", otp)
    return await otp.save();
  }

  // async findVerifiedUser(payload: ResetPasswordDto): Promise<IOtp | null > {
  //  return await this.otpModel.findOne({ _id: payload.otpId, isUsed: true }).exec();
  // }
  
}
