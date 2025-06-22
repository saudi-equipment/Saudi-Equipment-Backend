import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAd } from 'src/interfaces/ads';
import { ISubscription } from 'src/interfaces/payment/subscription.interface';
import { IUser } from 'src/interfaces/user';
import * as moment from 'moment';
import { CommonQueryDto } from 'src/common/dtos';
import { IPaymentTransaction } from 'src/interfaces/payment/payment.transaction.interface';
import { IAdPromotion } from 'src/interfaces/ad.promotion/ad.promotion.interface';
import { PromoteAdDto } from 'src/payment/dtos/promote-ad.dto';
import { SubscriptionDto } from 'src/payment/dtos/create-subscription.dto';
import { async } from 'rxjs';

@Injectable()
export class PaymentStore {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Subscription')
    private subscriptionModel: Model<ISubscription>,
    @InjectModel('AdPromotion') private adPromotionModel: Model<IAdPromotion>,
    @InjectModel('PaymentTransaction')
    private paymentTransactionModel: Model<IPaymentTransaction>,
    @InjectModel('Ad') private adModel: Model<IAd>,
  ) {}

  async existingSubscription(userId: string) {
    return await this.subscriptionModel.findOne({
      user: new Types.ObjectId(userId),
    });
  }

  async createSubscription(payload: SubscriptionDto) {
    try {
      const {
        id,
        invoice_id,
        price,
        created_at,
        userId,
        plan,
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

      const subscription = new this.subscriptionModel({
        subscribedBy: userId,
        transactionId: id,
        user: new Types.ObjectId(userId),
        plan,
        price,
        startDate,
        endDate,
        subscriptionStatus: 'active',
        invoice_id,
        paymentType,
        paymentCompany,
        ...payload,
      });

      await subscription.save();

      // Create payment transaction
      const paymentTransaction = new this.paymentTransactionModel({
        transactionId: id,
        subscriptionId: subscription._id.toString(),
        paymentType,
        paymentCompany,
        currency: 'SAR',
        price,
        status: payload.status,
        subscription: subscription._id,
        user: new Types.ObjectId(userId)
      });

      await paymentTransaction.save();

      await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { subscriptions: subscription._id } },
        { new: true },
      );

      return {
        subscription,
        paymentTransaction
      };
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
    limit: number,
    query: CommonQueryDto,
  ): Promise<{
    payments: any[];
    adAmountTotal: number;
    subscriptionAmountTotal: number;
    totalAmount: number;
    totalCount: number;
  }> {
    const { search, sortType, orderType } = query;
  
    const match: any = {
      transactionId: { $exists: true, $ne: null },
    };
  
    if (search) {
      match.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { paymentType: { $regex: search, $options: 'i' } },
        { paymentCompany: { $regex: search, $options: 'i' } },
      ];
    }
  
    const sortStage: Record<string, any> = {};
    if (sortType === 'Newest') sortStage.createdAt = -1;
    else if (sortType === 'Oldest') sortStage.createdAt = 1;
  
    if (orderType === 'A-Z') sortStage['user.name'] = 1;
    else if (orderType === 'Z-A') sortStage['user.name'] = -1;
  
    const pipeline = [
      { $match: match },
      { $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
  
      // Lookup User
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  
      // Lookup Subscription
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscriptionId',
          foreignField: '_id',
          as: 'subscription',
        },
      },
      {
        $set: {
          subscription: {
            $cond: {
              if: { $gt: [{ $size: '$subscription' }, 0] },
              then: { $arrayElemAt: ['$subscription', 0] },
              else: null,
            },
          },
        },
      },
  
      // Lookup Ad Promotion
      {
        $lookup: {
          from: 'adpromotions',
          localField: 'adPromotionId',
          foreignField: '_id',
          as: 'adPromotion',
        },
      },
      {
        $set: {
          adPromotion: {
            $cond: {
              if: { $gt: [{ $size: '$adPromotion' }, 0] },
              then: { $arrayElemAt: ['$adPromotion', 0] },
              else: null,
            },
          },
        },
      },
  
      // Projection
      {
        $project: {
          transactionId: 1,
          paymentType: 1,
          paymentCompany: 1,
          currency: 1,
          price: 1,
          status: 1,
          createdAt: 1,
          user: {
            _id: 1,
            name: 1,
            email: 1,
            phoneNumber: 1,
            city: 1,
          },
          subscriptionId: {
            $cond: [
              { $and: [
                { $ne: ['$subscriptionId', null] },
                { $ne: ['$subscriptionId', ''] }
              ]},
              '$subscriptionId',
              null
            ]
          },
          adpromotionId: {
            $cond: [
              { $and: [
                { $ne: ['$adpromotionId', null] },
                { $ne: ['$adpromotionId', ''] }
              ]},
              '$adpromotionId',
              null
            ]
          }
        },
      },
    ]
      // Run the aggregation and totals
      const [payments, totalCount, adTotals, subscriptionTotals] = await Promise.all([
        this.paymentTransactionModel.aggregate(pipeline),
        this.paymentTransactionModel.countDocuments(match),
        // Get ad promotion totals separately
        this.paymentTransactionModel.aggregate([
          { $match: match },
          { $match: { adpromotionId: { $ne: null } } },
          {
            $group: {
              _id: 'adpromotion',
              total: { $sum: '$price' },
              count: { $sum: 1 }
            }
          }
        ]),
        // Get subscription totals separately
        this.paymentTransactionModel.aggregate([
          { $match: match },
          { $match: { subscriptionId: { $ne: null } } },
          {
            $group: {
              _id: 'subscription',
              total: { $sum: '$price' },
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      const adTotal = adTotals.length ? adTotals[0].total : 0;
      const subscriptionTotal = subscriptionTotals.length ? subscriptionTotals[0].total : 0;

      return {
        payments,
        adAmountTotal: adTotal,
        subscriptionAmountTotal: subscriptionTotal,
        totalAmount: adTotal + subscriptionTotal,
        totalCount,
      };
    } catch (error) {
      throw error;
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

  async promoteAd(payload: PromoteAdDto) {
    try {
      const {
        adId,
        promotionPlan,
        userId,
        paymentType,
        paymentCompany,
        amount,
        status,
        transactionId,
      } = payload;

      const ad = await this.adModel.findById({ _id: adId, createdBy: userId });
      if (!ad) throw new Error('Ad not found');

      // if (ad.isPromoted) {
      //   throw new ConflictException('Ad already promoted');
      // }

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

      // Create AdPromotion document
      const adPromotion = new this.adPromotionModel({
        adId,
        promotionPrice: amount,
        currency: ad.currency,
        promotionPlan,
        promotionStartDate: currentDate,
        promotionEndDate,
        promotedBy: userId,
        user: new Types.ObjectId(userId),
        ad: new Types.ObjectId(adId),
      });

      // Create PaymentTransaction document
      const paymentTransaction = new this.paymentTransactionModel({
        transactionId,
        paymentType,
        paymentCompany,
        currency: ad.currency,
        price: amount,
        status,
        user: new Types.ObjectId(userId),
        adPromotion: adPromotion._id,
        adpromotionId: adPromotion._id,
        userId: userId
      });

      // Save all documents in a transaction
      const session = await this.adModel.startSession();
      session.startTransaction();

      try {
        await adPromotion.save({ session });
        await paymentTransaction.save({ session });

        // Update ad document
        ad.isPromoted = true;
        await ad.save({ session });

        await session.commitTransaction();
        return {
          ad,
          adPromotion,
          paymentTransaction,
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      throw error;
    }
  }
}
