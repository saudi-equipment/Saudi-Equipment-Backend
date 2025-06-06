import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionStore } from 'src/data-stores/subscripions/subscriptions.store';
import { SubscriptionController } from './subscriptions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, subscriptionSchema } from 'src/schemas/subscription/subscription.schema';
import { AdPackage, adsPackageSchema } from 'src/schemas/ad';
import { SubscriptionPlan, subscriptionPlanSchema } from 'src/schemas/subscription/subscription.plan.schema';
import { PaymentModule } from 'src/payment/payment.module';
import { forwardRef } from '@nestjs/common';
import { PaymentTransaction, paymentTransactionSchema } from 'src/schemas/payment.transaction/payment.transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: subscriptionSchema },
      { name: AdPackage.name, schema: adsPackageSchema },
      { name: SubscriptionPlan.name, schema: subscriptionPlanSchema },
      { name: PaymentTransaction.name, schema: paymentTransactionSchema }
    ]),
    forwardRef(() => PaymentModule),
  ],
  providers: [SubscriptionsService, SubscriptionStore],
  controllers: [SubscriptionController],
  exports: [SubscriptionStore],
})
export class SubscriptionsModule {}
