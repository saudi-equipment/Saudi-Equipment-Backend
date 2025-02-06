import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAd } from 'src/interfaces/ads';
import { ISubscription } from 'src/interfaces/payment/subscription.interface';
import { IUser } from 'src/interfaces/user';
import * as moment from 'moment';

@Injectable()
export class PaymentStore {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Subscription')
    private subscriptionModel: Model<ISubscription>,
    @InjectModel('Ad') private adModel: Model<IAd>,
  ) {}

  async findSubscription(id: string) {
    return await this.subscriptionModel.findOne(
      { id },
      {
        status: 'completed',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    );
  }

  async createSubscription(payload: any) {
    try {
      const {
        id: transactionId,
        invoice_id,
        price,
        created_at,
        userId,
        plan,
        duration,
        paymentType,
        paymentCompany
      } = payload;

      const startDate = new Date(created_at || Date.now());
      let endDate: Date;

      switch (plan) {
        case 'day':
          endDate = moment(startDate).add(1, 'day').toDate();
          break;
        case 'week':
          endDate = moment(startDate).add(1, 'week').toDate();
          break;
        case 'month':
          endDate = moment(startDate).add(1, 'month').toDate();
          break;
        case 'year':
          endDate = moment(startDate).add(1, 'year').toDate();
          break;
        default:
          throw new Error('Invalid subscription plan');
      }

      const subscription = new this.subscriptionModel({
        subscribedBy: userId,
        transactionId,
        user: new Types.ObjectId(userId),
        plan,
        price,
        startDate,
        endDate,
        subscriptionStatus: 'active',
        invoice_id,
        duration: duration,
        paymentType: paymentType,
        paymentCompany: paymentCompany,
        ...payload, 
      });

      await subscription.save();
      return subscription;
    } catch (error) {
      throw error;
    }
  }

  async promoteAd(payload: any) {
    try {
      const { adId, promotionPlan, userId, duration, paymentType, paymentCompany, transactionId } = payload;

      const ad = await this.adModel.findById({ _id: adId, createdBy: userId });
      if (!ad) throw new Error('Ad not found');

      const now = new Date();
      let promotionEndDate: Date;

      switch (promotionPlan) {
        case 'day':
          promotionEndDate = moment(now).add(1, 'day').toDate();
          break;
        case 'week':
          promotionEndDate = moment(now).add(1, 'week').toDate();
          break;
        case 'month':
          promotionEndDate = moment(now).add(1, 'month').toDate();
          break;
        case 'year':
          promotionEndDate = moment(now).add(1, 'year').toDate();
          break;
        default:
          throw new Error('Invalid promotion plan');
      }

      ad.isPromoted = true;
      ad.promotionPlan = promotionPlan;
      ad.promotionStartDate = now;
      ad.promotionEndDate = promotionEndDate;
      ad.duration = duration;
      ad.paymentCompany = paymentCompany;
      ad.paymentType = paymentType;
      ad.transactionId = transactionId;

      await ad.save();
      return ad;
    } catch (error) {
      throw error;
    }
  }
}
