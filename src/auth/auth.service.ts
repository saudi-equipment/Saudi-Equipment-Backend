import { User } from './../schemas/user/user.schema';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  SignUpDto,
  LoginDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AdminLoginDto,
} from './dtos';
import { UserService } from 'src/user/user.service';
import { OtpService } from './otp.service';
import { IUser } from 'src/interfaces/user';
import { hashPassword, validatePassword } from 'src/utils';
import { DigitalOceanService } from 'src/digital.ocean/digital.ocean.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly digitalOceanService: DigitalOceanService,
  
  ) {}

  async signUp(payload: SignUpDto) {
    
    // await this.userService.findExistingUserByPhoneNumber(payload.phoneNumber)
    await this.userService.findExistingUser(payload.email);
    validatePassword(payload.password, payload.confirmPassword);
  
    const hashedPassword = await hashPassword(payload.password);
    const userData = { ...payload, password: hashedPassword };
  
    const user = await this.userService.createUser(userData);
    const otp = await this.otpService.sendOtp(user.phoneNumber);
  
    return { user, otp };
  }
  
  async signIn(
    userLoginDto: LoginDto,
  ): Promise<{ token: string; otpId: string; user: IUser; message: string }> {
    const user = await this.userService.findExistingUserByPhoneNumber(
      userLoginDto.phoneNumber,
    );

    if (user.isVerified === false) {
      const otp = await this.otpService.sendOtp(userLoginDto.phoneNumber);
      return {
        message: 'User is not verified. OTP has been sent to the phone number.',
        token: null,
        otpId: otp.otpResponse.id,
        user,
      };
    }

    const isPasswordValid = await bcrypt.compare(
      userLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    user.password = undefined;

    return {
      token,
      otpId: null,
      user,
      message: 'Login successfully',
    };
  }

  async adminSignIn(
    adminLoginDto: AdminLoginDto,
  ): Promise<{ token: string; otpId: string; user: IUser; message: string }> {
    const user = await this.userService.findAdminByEmail(
      adminLoginDto.email,
    );

    if (user.isDeleted === true) {
      throw new UnauthorizedException('Admin Not Found');
    }

    const isPasswordValid = await bcrypt.compare(
      adminLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    user.password = undefined;

    return {
      token,
      otpId: null,
      user,
      message: 'Login successfully',
    };
  }

  async changePassword(user: User, payload: ChangePasswordDto) {
    try {
      if (!user.password) {
        throw new ForbiddenException('Please set password first');
      }

      const isPasswordMatch = bcrypt.compareSync(
        payload.oldPassword,
        user.password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestException('Old password is incorrect');
      }

      if (payload.oldPassword === payload.newPassword) {
        throw new BadRequestException('New password cannot be the same as the old password');
      }
     
      validatePassword(payload.newPassword, payload.confirmedPassword);

      const hashedPassword = await hashPassword(payload.newPassword);
      await this.userService.updatePassword(hashedPassword, user.phoneNumber);

      return { message: 'Password changed successfully'};
    } catch (error) {
      throw new Error(error.message || 'Error resetting password');
    }
  }

  async resetPassword(payload: ResetPasswordDto) {
    try {
      const user = await this.userService.findUserById(payload.userId);

      const isPasswordMatch = bcrypt.compareSync(
        payload.newPassword,
        user.password,
      );
      if (isPasswordMatch) {
        throw new BadRequestException(
          'New password cannot be the same as the current password',
        );
      }

      if (payload.newPassword !== payload.confirmPassword) {
        throw new ForbiddenException('Passwords do not match');
      }

      const hashedPassword = await hashPassword(payload.newPassword);
      await this.userService.updatePassword(hashedPassword, user.phoneNumber);

      return {
        message: 'Password reset successfully',
        userId: user.id,
      };
    } catch (error) {
      throw error
    }
  }
}
