import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { otpSchema } from 'src/schemas/otp/otp.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { OtpStore } from 'src/data-stores/otp/otp.store';
import { DigitalOceanModule } from 'src/digital.ocean/digital.ocean.module';
import { ExpireAdsMiddleware } from 'src/middleware/expire-ads-middleware';
import { AdModule } from 'src/ads/ad.module';
import { PaymentModule } from 'src/payment/payment.module';
import { OneSignalModule } from 'src/onesignal/onesignal.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => DigitalOceanModule),
    AdModule, PaymentModule, OneSignalModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    MongooseModule.forFeature([{ name: 'Otp', schema: otpSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secretKey = configService.get<string>('SECRET_KEY');

        if (!secretKey) {
          throw new Error('SECRET_KEY is not defined in environment variables');
        }

        return {
          secret: secretKey,
          signOptions: { expiresIn: '4d' },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    OtpService,
    OtpStore,
    ExpireAdsMiddleware,
    ExpireAdsMiddleware,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
