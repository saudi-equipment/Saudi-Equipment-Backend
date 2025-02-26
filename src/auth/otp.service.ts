import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OtpStore } from 'src/data-stores/otp/otp.store';
import { NotificationService } from 'src/notification/notification.service';
import { UserService } from 'src/user/user.service';
import {
  generateExpireTime,
  generateSixDigitCode,
} from 'src/utils/generate.otp.helper';
import { VerifyOtpDto } from './dtos/verify.otp.dto';
import { IOtp } from 'src/interfaces/otp/otp.interface';
import { User } from 'src/schemas/user/user.schema';
import { ResendOtpDto } from './dtos';

@Injectable()
export class OtpService {
  constructor(
    private readonly userService: UserService,
    private readonly otpStore: OtpStore,
    private readonly notificationService: NotificationService,
  ) {}

  async sendOtp(phoneNumber: string) {
    try {
      let otpResponse: IOtp;
      const existingUser =
        await this.userService.findExistingUserByPhoneNumber(phoneNumber);
      existingUser.password = undefined;
      const code = generateSixDigitCode();
      const otpExpireTime = generateExpireTime();

      if (existingUser) {
        const existingOtp = await this.otpStore.findExitingOtpByPhoneNumber(
          existingUser.phoneNumber,
        );
        if (existingOtp) {
          otpResponse = await this.otpStore.updateOtp(
            code,
            otpExpireTime,
            existingOtp.id,
          );
        } else {
          otpResponse = await this.otpStore.createOtp(
            code,
            otpExpireTime,
            existingUser.phoneNumber,
          );
        }

        await this.notificationService.sendSms(
          otpResponse.phoneNumber,
          otpResponse.code,
        );
        return { otpResponse, existingUser };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw error;
    }
  }

  async sendVerificationEmail(user: User) {
    try {
      let otpResponse: IOtp;
      const existingUser = await this.userService.findUserByEmail(user.email);
      existingUser.password = undefined;
      const code = generateSixDigitCode();
      const otpExpireTime = generateExpireTime();

      if (existingUser) {
        const existingOtp = await this.otpStore.findExistingOtpByEmail(
          existingUser.email,
        );
        if (existingOtp) {
          otpResponse = await this.otpStore.updateOtp(
            code,
            otpExpireTime,
            existingOtp.id,
          );
        } else {
          otpResponse = await this.otpStore.createOtp(
            code,
            otpExpireTime,
            existingUser.phoneNumber,
            existingUser.email,
          );
        }

        await this.notificationService.sendMail(
          otpResponse.email,
          otpResponse.code,
        );
        return { otpResponse, existingUser };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(payload: VerifyOtpDto) {
    try {
      const { otpId, code, userId, email } = payload;
      const currentTime = new Date();
      const existingOtp = await this.otpStore.findOtpById(otpId);

      if (!existingOtp) {
        throw new NotFoundException('OTP not found');
      }

      let user = null;
      if (userId) {
        user = await this.userService.findUserById(userId);
      } else if (email) {
        user = await this.userService.findUserByEmail(email);
      }

      if (!user) {
        throw new NotFoundException('User not found');
      }  

      if (existingOtp.isUsed == true) {
        throw new ForbiddenException('OTP is already used');
      }

      if (existingOtp.code !== code) {
        throw new ForbiddenException('Invalid OTP');
      }

      if (new Date(existingOtp.expireTime) <= currentTime) {
        throw new ForbiddenException('OTP is expired');
      }

      if (user.isVerified == true && user.isEmailVerified == true) {
        await this.otpStore.update(otpId, code);
        await this.otpStore.deleteOtp(otpId);
        return {
          message: 'User verification successful',
        };
      } 
       
        if (user.email) {
          await this.userService.verifyEmail(user.email);
        } else {
          await this.userService.verifyUser(user.id);
        }

        await this.otpStore.update(otpId, code);
        await this.otpStore.deleteOtp(otpId);
        return {
          message: 'User verification successful',
        };

    } catch (error) {
      throw error;
    }
  }

  async resendOpt(payload: ResendOtpDto) {
    const otpExpireTime = generateExpireTime();
    const {email, phoneNumber } = payload;
    let existingOtp;
    
    if(phoneNumber){
      existingOtp = await this.otpStore.findExitingOtpByPhoneNumber(phoneNumber);
    }

    if(email){
      existingOtp = await this.otpStore.findExistingOtpByEmail(email);
    }

    if (!existingOtp) {
      throw new NotFoundException('Otp not found');
    }

    const otpCode = generateSixDigitCode();
    const updatedOtp = await this.otpStore.updateOtp(
      otpCode,
      otpExpireTime,
      existingOtp.id,
    );

    if(phoneNumber){
     await this.notificationService.sendSms(phoneNumber, otpCode);
    }

    if(email){
     await this.notificationService.sendMail(email, otpCode);
    }

    return {
      otpId: updatedOtp.id,
      otpCode: updatedOtp.code,
      message: 'OTP sent successfully',
    };
  }

  async deleteOtp(otpId: string) {
    return this.otpStore.deleteOtp(otpId);
  }
}
