import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdStore } from '../data-stores/ad/ad.store';
import { PaymentStore } from '../data-stores/payment/payment.data.store';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly adStore: AdStore,
    private readonly paymentStore: PaymentStore,
  ) {
    this.logger.log('TasksService initialized');
  }

  // @Cron(CronExpression.EVERY_10_SECONDS)
  @Cron('0 0 * * *')
  async handleExpirations() {
    try {
      this.logger.debug('Running ad expiration check...');
      const result = await this.adStore.expireAllAds();
      const result2 = await this.paymentStore.expireAllSubscriptions();
      this.logger.debug(`Ad expiration check completed: ${result}`);
      this.logger.debug(`Subscription expiration check completed: ${result2}`);
    } catch (error) {
      this.logger.error('Error in handleExpirations:', error);
    }
  }
}