import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAd } from 'src/interfaces/ads';
import { ISubscription } from 'src/interfaces/payment/subscription.interface';
import { IUser } from 'src/interfaces/user';
import * as moment from 'moment';
import { CommonQueryDto } from 'src/common/dtos';

@Injectable()
export class PaymentStore {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Subscription')
    private subscriptionModel: Model<ISubscription>,
    @InjectModel('Ad') private adModel: Model<IAd>,
  ) {}

  async existingSubscription(userId: string) {
    return await this.subscriptionModel.findOne({
      user: new Types.ObjectId(userId),
    });
  }

  async createOrUpdateSubscription(payload: any) {
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
        paymentCompany,
      } = payload;

      const startDate = new Date(created_at || Date.now());
      let endDate: Date;

      switch (plan) {
        case 'month':
          endDate = moment(startDate).add(1, 'month').toDate();
          break;
        case 'year':
          endDate = moment(startDate).add(1, 'year').toDate();
          break;
        default:
          throw new Error('Invalid subscription plan');
      }

      const existingSubscription = await this.subscriptionModel.findOne({
        user: new Types.ObjectId(userId),
      });

      let subscription;

      if (existingSubscription) {
        subscription = await this.subscriptionModel.findByIdAndUpdate(
          existingSubscription._id,
          {
            transactionId,
            plan,
            price,
            startDate,
            endDate,
            subscriptionStatus: 'active',
            invoice_id,
            duration,
            paymentType,
            paymentCompany,
            ...payload,
          },
          { new: true },
        );
      } else {
        subscription = new this.subscriptionModel({
          subscribedBy: userId,
          transactionId,
          user: new Types.ObjectId(userId),
          plan,
          price,
          startDate,
          endDate,
          subscriptionStatus: 'active',
          invoice_id,
          duration,
          paymentType,
          paymentCompany,
          ...payload,
        });

        await subscription.save();
      }

      await this.userModel.findByIdAndUpdate(
        userId,
        { subscription: subscription._id },
        { new: true },
      );

      return subscription;
    } catch (error) {
      throw error;
    }
  }
  async getSubscription(userId: string) {
    try {
      const subscriptionDetails = await this.subscriptionModel.aggregate([
        {
          $match: { user: new Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            transactionId: 1,
            subscriptionName: 1,
            subscribedBy: 1,
            paymentType: 1,
            paymentCompany: 1,
            plan: 1,
            duration: 1,
            description: 1,
            subscriptionStatus: 1,
            price: 1,
            startDate: 1,
            endDate: 1,
            'userDetails.name': 1,
            'userDetails.email': 1,
            'userDetails.phoneNumber': 1,
            'userDetails.city': 1,
            'userDetails.isPremiumUser': 1,
          },
        },
      ]);

      return subscriptionDetails;
    } catch (error) {
      throw new Error(`Error fetching subscription: ${error.message}`);
    }
  }

  async getAllPaymentDetails(
    skip: number,
    currentLimit: number,
    query: CommonQueryDto,
  ): Promise<{
    payments: any[];
    adAmountTotal: number;
    subscriptionAmountTotal: number;
    totalAmount: number;
    totalCount: number;
  }> {
    const { search, sortType, orderType } = query;

    const baseMatch: any = {
      transactionId: { $exists: true, $ne: null },
    };

    if (search) {
      baseMatch.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { paymentType: { $regex: search, $options: 'i' } },
        { paymentCompany: { $regex: search, $options: 'i' } },
      ];
    }

    const sortStage: Record<string, any> = {};

    if (sortType === 'Newest') {
      sortStage.createdAt = -1;
    } else if (sortType === 'Oldest') {
      sortStage.createdAt = 1;
    }

    if (orderType === 'A-Z') {
      sortStage['user.name'] = 1;
    } else if (orderType === 'Z-A') {
      sortStage['user.name'] = -1;
    }

    const [adPayments, adCountResult, adAmountResult] = await Promise.all([
      this.adModel.aggregate([
        { $match: baseMatch },
        {
          $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 },
        },
        { $skip: skip },
        { $limit: currentLimit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            transactionId: 1,
            paymentType: 1,
            paymentCompany: 1,
            amount: '$promotionPrice',
            currency: 1,
            type: { $literal: 'ad promotion' },
            adId: 1,
            isPromoted: 1,
            promotionPlan: 1,
            promotionStartDate: 1,
            promotionEndDate: 1,
            duration: 1,
            createdAt: 1,
            'user._id': 1,
            'user.name': 1,
            'user.phoneNumber': 1,
            'user.email': 1,
            'user.city': 1,
          },
        },
      ]),
      this.adModel.countDocuments(baseMatch),
      this.adModel.aggregate([
        { $match: baseMatch },
        { $group: { _id: null, totalAmount: { $sum: '$price' } } },
      ]),
    ]);

    const [
      subscriptionPayments,
      subscriptionCountResult,
      subscriptionAmountResult,
    ] = await Promise.all([
      this.subscriptionModel.aggregate([
        { $match: baseMatch },
        {
          $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 },
        },
        { $skip: skip },
        { $limit: currentLimit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            transactionId: 1,
            paymentType: 1,
            paymentCompany: 1,
            amount: '$price',
            currency: 1,
            plan: '$plan',
            duration: '$duration',
            startDate: 1,
            endDate: 1,
            subscriptionStatus: '$subscriptionStatus',
            type: { $literal: 'subscription' },
            createdAt: 1,
            updatedAt: 1,
            'user._id': 1,
            'user.name': 1,
            'user.phoneNumber': 1,
            'user.email': 1,
            'user.city': 1,
          },
        },
      ]),
      this.subscriptionModel.countDocuments(baseMatch),
      this.subscriptionModel.aggregate([
        { $match: baseMatch },
        { $group: { _id: null, totalAmount: { $sum: '$price' } } },
      ]),
    ]);

    const adAmountTotal = adAmountResult[0]?.totalAmount || 0;
    const subscriptionAmountTotal =
      subscriptionAmountResult[0]?.totalAmount || 0;

    const combinedPayments = [...adPayments, ...subscriptionPayments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      adAmountTotal,
      subscriptionAmountTotal,
      totalAmount: adAmountTotal + subscriptionAmountTotal,
      totalCount: adCountResult + subscriptionCountResult,
      payments: combinedPayments,
    };
  }

  async expireUserSubscription(userId: string): Promise<void> {
    try {
      const currentDate = new Date();
      const activeSubscription = await this.subscriptionModel.findOne({
        user: new Types.ObjectId(userId),
        subscriptionStatus: 'active',
        endDate: { $lt: currentDate },
      });

      if (activeSubscription) {
        await this.subscriptionModel.updateOne(
          { _id: activeSubscription._id },
          { subscriptionStatus: 'inactive' },
        );

        await this.userModel.updateOne(
          { _id: userId },
          { isPremiumUser: false },
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async promoteAd(payload: any) {
    try {
      const {
        adId,
        promotionPlan,
        userId,
        paymentType,
        paymentCompany,
        transactionId,
        amount,
      } = payload;

      const ad = await this.adModel.findById({ _id: adId, createdBy: userId });
      if (!ad) throw new Error('Ad not found');

      if (ad.isPromoted) {
        throw new ConflictException('Ad already promoted');
      }

      const currentDate = new Date();
      let promotionEndDate: Date;

      switch (promotionPlan) {
        case '7days':
          promotionEndDate = moment(currentDate).add(7, 'days').toDate();
          break;
        case '15days':
          promotionEndDate = moment(currentDate).add(15, 'days').toDate();
          break;
        case '30days':
          promotionEndDate = moment(currentDate).add(30, 'days').toDate();
          break;
        default:
          throw new Error('Invalid promotion plan');
      }

      ad.isPromoted = true;
      ad.promotionPlan = promotionPlan;
      ad.promotionStartDate = currentDate;
      ad.promotionEndDate = promotionEndDate;
      ad.paymentCompany = paymentCompany;
      ad.paymentType = paymentType;
      ad.transactionId = transactionId;
      ad.promotionPrice = amount;
      await ad.save();
      return ad;
    } catch (error) {
      throw error;
    }
  }
}
