import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionStore } from 'src/data-stores/subscripions/subscriptions.store';
import { SubscriptionController } from './subscriptions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, subscriptionSchema } from 'src/schemas/subscription/subscription.schema';
import { AdPackage, adsPackageSchema } from 'src/schemas/ad';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: subscriptionSchema },
      { name: AdPackage.name, schema: adsPackageSchema },
    ]),
  ],
  providers: [SubscriptionsService, SubscriptionStore],
  controllers: [SubscriptionController],
  exports: [SubscriptionStore],
})
export class SubscriptionsModule {}
