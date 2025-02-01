import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto, LoginDto, ResetPasswordDto } from './dtos';
import { UserService } from 'src/user/user.service';
import { OtpService } from './otp.service';
import { IUser } from 'src/interfaces/user';
import { hashPassword, validatePassword } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async signUp(payload: SignUpDto) {
    validatePassword(payload.password, payload.confirmPassword);

    await this.userService.findExistingUser(payload.email);
    // await this.userService.findExistingUserByPhoneNumber(payload.phoneNumber)

    const hashedPassword = await hashPassword(payload.password);
    const userData = { ...payload, password: hashedPassword };

    const user = await this.userService.createUser(userData);
    const otp = await this.otpService.sendOtp(user.phoneNumber);
    return {
      user,
      otp,
    };
  }

  async signIn(userLoginDto: LoginDto): Promise<{ token: string; otpId: string; user: IUser; message: string }> {
    const user = await this.userService.findExistingUserByPhoneNumber(userLoginDto.phoneNumber);

    if(user.isDeleted === true){
      throw new UnauthorizedException("User Not Found")
    }

    if (user.isVerified === false) {
      const otp = await this.otpService.sendOtp(userLoginDto.phoneNumber);
      return {
        message: 'User is not verified. OTP has been sent to the phone number.',
        token: null,
        otpId: otp.otpResponse.id,
        user,
      };
    }

    const isPasswordValid = await bcrypt.compare(userLoginDto.password, user.password);
  
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    user.password = undefined
  
    return {
      token,
      otpId: null,
      user,
      message: 'Login successful',
    };
  }

  async resetPassword(payload: ResetPasswordDto) {
    try {
      const user = await this.userService.findUserById(payload.userId);
      const isPasswordMatch = bcrypt.compareSync(payload.newPassword, user.password);
      if (isPasswordMatch) {
        throw new BadRequestException('New password cannot be the same as the current password');
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
      throw new Error(error.message || 'Error resetting password');
    }
  }
}
