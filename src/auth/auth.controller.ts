import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AdminLoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
  SignUpDto,
  VerifyOtpDto,
} from './dtos';
import { OtpService } from './otp.service';
import { User } from 'src/schemas/user/user.schema';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from './guard/roles.gurad';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { GetUser } from 'src/decorators/user.decorator';
import { Public } from 'src/decorators/public.routes.decorator';
import { UserService } from 'src/user/user.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('sign-up')
  async signUp(@Res() response, @Body() payload: SignUpDto) {
    try {
      const data = await this.authService.signUp(payload);
      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        user: data.user,
        otp: data.otp,
      });
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Res() response, @Body() payload: VerifyOtpDto) {
    try {
      await this.userService.checkUserBlockStatusByPhoneNumber(payload.email);
      const data = await this.otpService.verifyOtp(payload);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @Post('send-verification-email')
  async sendVerificationEmail(@GetUser() user: User) {
    try {
      return await this.otpService.sendVerificationEmail(user);
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Post('resend-otp')
  async resSendOtp(@Body() payload: ResendOtpDto) {
    try {
      await this.userService.checkUserBlockStatusByEmail(payload.email);
      return await this.otpService.resendOpt(payload);
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Res() response, @Body() payload: ForgotPasswordDto) {
    try {
      await this.userService.checkUserBlockStatusByPhoneNumber(
        payload.phoneNumber,
      );
      const phoneNumber = payload.phoneNumber;
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

  @Public()
  @Put('reset-password')
  async resetPassword(@Res() response, @Body() payload: ResetPasswordDto) {
    try {
      await this.userService.checkUserBlockStatusByUserId(payload.userId);
      const data = await this.authService.resetPassword(payload);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Put('change-password')
  async changePassword(
    @Res() response,
    @GetUser() user: User,
    @Body() payload: ChangePasswordDto,
  ) {
    try {
      await this.authService.changePassword(user, payload);
      return response.status(200).json({
        message: 'Password updated successfully',
      });
    } catch (error) {
      return response.status(error.status || 500).json({
        message: error.message || 'Failed to change password',
      });
    }
  }

  @Public()
  @Post('login')
  async signIn(@Body() userLoginDto: LoginDto, @Res() response) {
    try {
      await this.userService.checkUserBlockStatusByPhoneNumber(
        userLoginDto.phoneNumber,
      );
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
        message: 'Login successfully',
        accessToken: token,
        user
      });
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Post('admin-login')
  async adminSignIn(@Body() adminLoginDto: AdminLoginDto, @Res() response) {
    try {
      const { token, message, user } =
        await this.authService.adminSignIn(adminLoginDto);

      if (token === null) {
        return response.status(HttpStatus.FORBIDDEN).json({
          statusCode: HttpStatus.FORBIDDEN,
          message: message,
          accessToken: null,
          userId: user.id,
        });
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Login successfully',
        accessToken: token,
        user,
      });
    } catch (error) {
      throw error;
    }
  }
}
