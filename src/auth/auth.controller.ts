import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, ResendOtpDto, ResetPasswordDto, SignUpDto, VerifyOtpDto } from './dtos';
import { OtpService } from './otp.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Post('sign-up')
  async signUp(@Res() response, @Body() payload: SignUpDto) {
    try {
      const data = await this.authService.signUp(payload);
      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        user: data.user,
        otp: data.otp
      });
    } catch (error) {
      throw error;
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Res() response, @Body() payload: VerifyOtpDto) {
    try {
      const data = await this.otpService.verifyOtp(payload);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Post('resend-otp')
  async resSendOtp(@Body() payload: ResendOtpDto) {
    try {
      const phoneNumber = payload.phoneNumber;
      return await this.otpService.resendOpt(phoneNumber);
    } catch (error) {
      throw error;
    }
  }

  @Post('forgot-password')
  async forgotPassword(
    @Res() response,
    @Body() payload: ForgotPasswordDto,
  ) {
    try {
      const phoneNumber = payload.phoneNumber
      const data = await this.otpService.sendOtp(phoneNumber);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        userId: data.existingUser.id,
        otpId: data.otpResponse.id,
      });
    } catch (error) {
      throw error;
    }
  }

  @Put('reset-password')
  async resetPassword(@Res() response, @Body() payload: ResetPasswordDto) {
    try {
      const data = await this.authService.resetPassword(payload);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  async signIn(@Body() userLoginDto: LoginDto, @Res() response) {
    try {
      const { token, otpId, message, user } =
        await this.authService.signIn(userLoginDto);

      if (token === null) {
        return response.status(HttpStatus.FORBIDDEN).json({
          statusCode: HttpStatus.FORBIDDEN,
          message: message,
          accessToken: null,
          userId: user.id,
          otpId,
        });
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        accessToken: token,
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          city: user.city,
          isPremiumUser: user.isPremiumUser,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
