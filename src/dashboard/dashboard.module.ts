import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { subscriptionSchema } from 'src/schemas/subscription/subscription.schema';
import { userSchema } from 'src/schemas/user/user.schema';
import { adsSchema } from 'src/schemas/ad/ad.schema';
import { DashboardStore } from 'src/data-stores/dashboard/dashboard.store';
import { paymentTransactionSchema } from 'src/schemas/payment.transaction/payment.transaction.schema';
import { adPromotionSchema } from 'src/schemas/ad/ad.promotion.schema';
  
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Subscription', schema: subscriptionSchema },
      { name: 'User', schema: userSchema },
      { name: 'Ad', schema: adsSchema },
      { name: 'PaymentTransaction', schema: paymentTransactionSchema },
      { name: 'AdPromotion', schema: adPromotionSchema },
    ]),
  ],
  providers: [DashboardService, DashboardStore],
  controllers: [DashboardController],
})
export class DashboardModule {}
