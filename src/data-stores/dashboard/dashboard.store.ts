import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { EarningsReportDto } from 'src/dashboard/dtos/earning.report.dto';
import { IAd } from 'src/interfaces/ads';
import { ISubscription } from 'src/interfaces/payment/subscription.interface';
import { IUser } from 'src/interfaces/user';
import { IPaymentTransaction } from 'src/interfaces/payment/payment.transaction.interface';

@Injectable()
export class DashboardStore {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Subscription')
    private subscriptionModel: Model<ISubscription>,
    @InjectModel('Ad') private adModel: Model<IAd>,
    @InjectModel('PaymentTransaction') private paymentTransactionModel: Model<IPaymentTransaction>,
  ) {}

  async calculateTotalMetrics() {
    // Current period metrics (last 30 days)
    const currentDate = new Date();
    const previousPeriodDate = new Date();
    previousPeriodDate.setDate(currentDate.getDate() - 1);

    // Total Users (all time and current period)
    const totalUsers = await this.userModel.countDocuments();
    const currentPeriodUsers = await this.userModel.countDocuments({
      createdAt: { $gte: previousPeriodDate },
    });
    const previousPeriodUsers = totalUsers - currentPeriodUsers;
    const userGrowthPercentage =
      previousPeriodUsers > 0
        ? (
            ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) *
            100
          ).toFixed(2) + '%'
        : 'No previous data';

    // Total Ads (all time and current period)
    const totalAds = await this.adModel.countDocuments();
    const currentPeriodAds = await this.adModel.countDocuments({
      createdAt: { $gte: previousPeriodDate },
    });
    const previousPeriodAds = totalAds - currentPeriodAds;
    const adGrowthPercentage =
      previousPeriodAds > 0
        ? (
            ((currentPeriodAds - previousPeriodAds) / previousPeriodAds) *
            100
          ).toFixed(2) + '%'
        : 'No previous data';

    // Total Subscriptions (all time and current period)
    const totalSubscriptions = await this.subscriptionModel.countDocuments({
      transactionId: { $exists: true, $ne: null },
    });
    const currentPeriodSubscriptions =
      await this.subscriptionModel.countDocuments({
        transactionId: { $exists: true, $ne: null },
        startDate: { $gte: previousPeriodDate },
      });

    const previousPeriodSubscriptions =
      totalSubscriptions - currentPeriodSubscriptions;
    const subscriptionGrowthPercentage =
      previousPeriodSubscriptions > 0
        ? (
            ((currentPeriodSubscriptions - previousPeriodSubscriptions) /
              previousPeriodSubscriptions) *
            100
          ).toFixed(2) + '%'
        : 'No previous data';

    // Total Featured Ads (all time and current period)
    const totalFeaturedAds = await this.adModel.countDocuments({
      isPromoted: true,
    });
    const currentPeriodFeaturedAds = await this.adModel.countDocuments({
      isPromoted: true,
      createdAt: { $gte: previousPeriodDate },
    });

    const previousPeriodFeaturedAds =
      totalFeaturedAds - currentPeriodFeaturedAds;
    const featuredAdsGrowthPercentage =
      previousPeriodFeaturedAds > 0
        ? (
            ((currentPeriodFeaturedAds - previousPeriodFeaturedAds) /
              previousPeriodFeaturedAds) *
            100
          ).toFixed(2) + '%'
        : 'No previous data';

    return {
      totalUsers,
      totalAds,
      totalSubscriptions,
      totalFeaturedAds,
      userGrowthPercentage,
      adGrowthPercentage,
      subscriptionGrowthPercentage,
      featuredAdsGrowthPercentage,
    };
  }

  async getSubscriptionPricesWeekly(): Promise<
    Array<{
      day: string;
      series1: number;
      series2: number;
    }>
  > {
    const now = moment();
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const result = daysOfWeek.map((day) => ({
      day,
      series1: 0, 
      series2: 0,
    }));

    const currentWeekStart = now.clone().startOf('week');
    const currentWeekEnd = now.clone().endOf('week');
    const previousWeekStart = currentWeekStart.clone().subtract(1, 'week');
    const previousWeekEnd = currentWeekEnd.clone().subtract(1, 'week');

    const [currentWeekSubs, previousWeekSubs] = await Promise.all([
      this.subscriptionModel
        .find({
          $or: [
            {
              startDate: {
                $gte: currentWeekStart.toDate(),
                $lte: currentWeekEnd.toDate(),
              },
            },
            {
              createdAt: {
                $gte: currentWeekStart.toDate(),
                $lte: currentWeekEnd.toDate(),
              },
            },
          ],
          transactionId: { $exists: true },
        })
        .exec(),
      this.subscriptionModel
        .find({
          $or: [
            {
              startDate: {
                $gte: previousWeekStart.toDate(),
                $lte: previousWeekEnd.toDate(),
              },
            },
            {
              createdAt: {
                $gte: previousWeekStart.toDate(),
                $lte: previousWeekEnd.toDate(),
              },
            },
          ],
          transactionId: { $exists: true },
        })
        .exec(),
    ]);

    // Process current week subscriptions (series1)
    currentWeekSubs.forEach((sub: ISubscription) => {
      const subscriptionDate = sub.startDate || sub.createdAt;
      if (!subscriptionDate) return;

      const dayOfWeek = moment(subscriptionDate).day();
      result[dayOfWeek].series1 += sub.price || 0;
    });

    // Process previous week subscriptions (series2)
    previousWeekSubs.forEach((sub: ISubscription) => {
      const subscriptionDate = sub.startDate || sub.createdAt;
      if (!subscriptionDate) return;

      const dayOfWeek = moment(subscriptionDate).day();
      result[dayOfWeek].series2 += sub.price || 0;
    });

    return result;
  }

  async getEarningsReport(periodType: 'month' | 'year' = 'year', periodValue?: string): Promise<{
    total: number;
    percentageChange: number;
    period: string;
    periodType: 'month' | 'year';
  }> {
    const now = moment();
    let currentStart: moment.Moment;
    let currentEnd: moment.Moment;
    let previousStart: moment.Moment;
    let previousEnd: moment.Moment;
    let periodLabel: string;

    if (periodType === 'month') {
      const [year, month] = periodValue?.split('-').map(Number) || [now.year(), now.month()];
      currentStart = moment([year, month]).startOf('month');
      currentEnd = moment([year, month]).endOf('month');
      previousStart = currentStart.clone().subtract(1, 'year');
      previousEnd = currentEnd.clone().subtract(1, 'year');
      periodLabel = currentStart.format('MMMM YYYY');
    } else {
      const year = periodValue ? Number(periodValue) : now.year();
      currentStart = moment([year]).startOf('year');
      currentEnd = moment([year]).endOf('year');
      previousStart = currentStart.clone().subtract(1, 'year');
      previousEnd = currentEnd.clone().subtract(1, 'year');
      periodLabel = year.toString();
    }

    const [currentEarnings, previousEarnings] = await Promise.all([
      this.calculateTotalEarnings(currentStart, currentEnd),
      this.calculateTotalEarnings(previousStart, previousEnd)
    ]);

    const percentageChange = previousEarnings > 0
      ? ((currentEarnings - previousEarnings) / previousEarnings) * 100
      : 0;

    return {
      total: currentEarnings,
      percentageChange: parseFloat(percentageChange.toFixed(2)),
      period: periodLabel,
      periodType
    };
  }

  private async calculateTotalEarnings(startDate: moment.Moment, endDate: moment.Moment): Promise<number> {
    const transactions = await this.paymentTransactionModel.find({
      status: 'paid',
      createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    })
    .populate('subscription adPromotion')
    .exec();

    const totalEarnings = transactions.reduce((sum, transaction) => {
      return sum + (transaction.price || 0);
    }, 0);

    return totalEarnings;
  }
}
