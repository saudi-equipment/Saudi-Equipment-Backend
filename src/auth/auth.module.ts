import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { otpSchema } from 'src/schemas/otp/otp.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { OtpStore } from 'src/data-stores/otp/otp.store';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    ConfigModule.forRoot(),
    PassportModule,
    MongooseModule.forFeature([{ name: 'Otp', schema: otpSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '2d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, OtpService, OtpStore, JwtService],
  controllers: [AuthController],
  exports: [JwtService]
})
export class AuthModule {}
