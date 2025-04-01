import { Injectable } from '@nestjs/common';
import { DashboardStore } from 'src/data-stores/dashboard/dashboard.store';
import { EarningsReportDto } from './dtos/earning.report.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly newsLetterStore: DashboardStore) {}

  async calculateTotalMetrics() {
    return await this.newsLetterStore.calculateTotalMetrics();
  }

  async getSubscriptionPricesWeekly() {
    return await this.newsLetterStore.getSubscriptionPricesWeekly();
  }

  async getEarningsReport(
    periodType: 'month' | 'year' = 'year',
    periodValue?: string,
  ) {
    return await this.newsLetterStore.getEarningsReport(
      periodType,
      periodValue,
    );
  }
}
