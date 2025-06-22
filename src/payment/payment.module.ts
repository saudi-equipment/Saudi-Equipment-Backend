import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { WebhooksModule } from 'src/webhooks/webhooks.module';
import { MongooseModule } from '@nestjs/mongoose';
import { subscriptionSchema } from 'src/schemas/subscription/subscription.schema';
import { userSchema } from 'src/schemas/user/user.schema';
import { adsSchema } from 'src/schemas/ad/ad.schema';
import { PaymentStore } from 'src/data-stores/payment/payment.data.store';
import { AdModule } from 'src/ads/ad.module';
import { UserModule } from 'src/user/user.module';
import { MoyasarModule } from 'src/moyasar/moyasar.module';
import { adPromotionSchema } from 'src/schemas/ad/ad.promotion.schema';
import { paymentTransactionSchema } from 'src/schemas/payment.transaction/payment.transaction.schema';
import { SubscriptionsModule } from 'src/admin/subscriptions/subscriptions.module';


@Module({
  imports: [
    forwardRef(() => WebhooksModule),
    forwardRef(() => AdModule),
    forwardRef(() => UserModule),
    forwardRef(() => SubscriptionsModule),
    MoyasarModule,
    MongooseModule.forFeature([
      { name: 'Subscription', schema: subscriptionSchema },
      { name: 'User', schema: userSchema },
      { name: 'Ad', schema: adsSchema },
      { name: 'AdPromotion', schema: adPromotionSchema },
      { name: 'PaymentTransaction', schema: paymentTransactionSchema },
    ]),
  ],
  providers: [PaymentService, PaymentStore],
  controllers: [PaymentController],
  exports: [PaymentService]
})
export class PaymentModule {}
