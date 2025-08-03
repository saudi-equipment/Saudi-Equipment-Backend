import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { adsSchema } from 'src/schemas/ad/ad.schema';
import { UserModule } from 'src/user/user.module';
import { AdStore } from 'src/data-stores/ad/ad.store';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';
import { userSchema } from 'src/schemas/user/user.schema';
import { DigitalOceanModule } from 'src/digital.ocean/digital.ocean.module';
import { reportAdSchema } from 'src/schemas/ad';
import { PaymentModule } from 'src/payment/payment.module';
import { NotificationModule } from 'src/notification/notification.module';
import { OneSignalModule } from 'src/onesignal/onesignal.module';
import { adPromotionSchema } from 'src/schemas/ad/ad.promotion.schema';
@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => DigitalOceanModule),
    forwardRef(() => PaymentModule),
    NotificationModule,
    OneSignalModule,
    MongooseModule.forFeature([
      { name: 'Ad', schema: adsSchema },
      { name: 'User', schema: userSchema },
      { name: 'ReportAd', schema: reportAdSchema },
      { name: 'AdPromotion', schema: adPromotionSchema },
    ]),
  ],
  providers: [AdService, AdStore],
  controllers: [AdController],
  exports: [AdStore, AdService]
})
export class AdModule {}
