import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  providers: [],
  controllers: [],
  imports: [SubscriptionsModule],
})
export class AdminModule {}
