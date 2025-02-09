import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from 'src/schemas/user/user.schema';
import { UserStore } from 'src/data-stores/user/user.store';
import { NotificationModule } from 'src/notification/notification.module';
import { AuthModule } from 'src/auth/auth.module';
import { AdModule } from 'src/ads/ad.module';
import { adsSchema } from 'src/schemas/ad/ad.schema';
import { PaymentModule } from 'src/payment/payment.module';
import { DigitalOceanModule } from 'src/digital.ocean/digital.ocean.module';
import { ExpireAdsMiddleware } from 'src/middleware/expire-ads-middleware';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => AuthModule),
    forwardRef(() => AdModule),
    forwardRef(() => DigitalOceanModule),
    MongooseModule.forFeature([{ name: 'User', schema: userSchema }, { name: 'Ad', schema: adsSchema }, ]),
  ],
  providers: [UserService, UserStore, ExpireAdsMiddleware],
  controllers: [UserController],
  exports: [UserService, UserStore]
})
export class UserModule {}
