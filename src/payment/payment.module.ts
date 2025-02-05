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

@Module({
  imports: [
    forwardRef(() => WebhooksModule),
    forwardRef(() => AdModule),
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: 'Subscription', schema: subscriptionSchema },
      { name: 'User', schema: userSchema },
      { name: 'Ad', schema: adsSchema },
    ]),
  ],
  providers: [PaymentService, PaymentStore],
  controllers: [PaymentController],
  exports: [PaymentService]
})
export class PaymentModule {}
