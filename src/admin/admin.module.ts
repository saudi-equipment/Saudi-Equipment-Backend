import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdsModule } from './ads/ads.module';
import { PackagesModule } from './packages/packages.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  providers: [],
  controllers: [],
  imports: [SubscriptionsModule, AdsModule, PackagesModule, PaymentModule],
})
export class AdminModule {}
