import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateSubscriptionDto,
  GetSubscriptionListQueryDto,
  UpdateSubscriptionDto,
} from 'src/admin/subscriptions/dtos';
import { UserRole } from 'src/enums';
import { AdPackage } from 'src/schemas/ad';
import { Subscription } from 'src/schemas/subscription/subscription.schema';
import { User } from 'src/schemas/user/user.schema';

@Injectable()
export class SubscriptionStore {
  constructor(
    @InjectModel('Subscription') private subscriptionModel: Model<Subscription>,
    @InjectModel('AdPackage') private adPackageModel: Model<AdPackage>,
  ) {}

  async createSubscription(
    user: User,
    payload: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = new this.subscriptionModel({
      ...payload,
      createdBy: new Types.ObjectId(user.id),
    });
    return subscription.save();
  }

  async getAllPackages() {
    return await this.adPackageModel.find();
  }

  async getAllSubscriptionsList(
    query: GetSubscriptionListQueryDto,
    skip: number,
    currentLimit: number,
  ) {
    const { search, sortType, orderType } = query;

    const matchStage: any = {
      transactionId: { $in: [null, ''] },
    };

    if (search) {
      matchStage.subscriptionName = { $regex: search, $options: 'i' };
    }

    const sortStage: Record<string, any> = {};
    if (sortType === 'Newest') sortStage.createdAt = -1;
    else if (sortType === 'Oldest') sortStage.createdAt = 1;
    if (orderType === 'A-Z') sortStage.subscriptionName = 1;
    else if (orderType === 'Z-A') sortStage.subscriptionName = -1;

    const result = await this.subscriptionModel.aggregate([
      { $match: matchStage },
      {
        $facet: {
          metadata: [
            {
              $group: {
                _id: null,
                totalSubscriptions: { $sum: 1 },
                activeSubscriptions: {
                  $sum: {
                    $cond: [{ $eq: ['$subscriptionStatus', 'active'] }, 1, 0],
                  },
                },
                inactiveSubscriptions: {
                  $sum: {
                    $cond: [{ $eq: ['$subscriptionStatus', 'inactive'] }, 1, 0],
                  },
                },
              },
            },
          ],
          subscriptions: [
            {
              $sort: Object.keys(sortStage).length
                ? sortStage
                : { createdAt: -1 },
            },
            { $skip: skip },
            { $limit: currentLimit },
            {
              $project: {
                _id: 1,
                subscriptionName: 1,
                plan: 1,
                duration: 1,
                description: 1,
                createdBy: 1,
                subscriptionStatus: 1,
                price: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
    ]);

    const metadata = result[0]?.metadata[0] || {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      inactiveSubscriptions: 0,
    };

    return {
      totalSubscriptions: metadata.totalSubscriptions,
      activeSubscriptions: metadata.activeSubscriptions,
      inactiveSubscriptions: metadata.inactiveSubscriptions,
      subscriptions: result[0]?.subscriptions || [],
    };
  }

  async usedSubscriptionsList(
    query: GetSubscriptionListQueryDto,
    skip: number,
    currentLimit: number,
  ) {
    const { search, sortType, orderType } = query;

    const matchStage: any = {
      transactionId: { $exists: true, $ne: null },
    };

    if (search) {
      matchStage.subscriptionName = { $regex: search, $options: 'i' };
    }

    const sortStage: Record<string, any> = {};
    if (sortType === 'Newest') sortStage.createdAt = -1;
    else if (sortType === 'Oldest') sortStage.createdAt = 1;
    if (orderType === 'A-Z') sortStage.subscriptionName = 1;
    else if (orderType === 'Z-A') sortStage.subscriptionName = -1;

    const subscribers = await this.subscriptionModel.countDocuments(matchStage);
    const totalEarningsResult = await this.subscriptionModel.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalEarnings: { $sum: '$price' } } },
    ]);

    const subscriptions = await this.subscriptionModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      { $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 } },
      { $skip: skip },
      { $limit: currentLimit },
      {
        $project: {
          _id: 1,
          transactionId: 1,
          subscribedBy: 1,
          paymentType: 1,
          paymentCompany: 1,
          subscriptionName: 1,
          plan: 1,
          duration: 1,
          description: 1,
          createdBy: 1,
          subscriptionStatus: 1,
          price: 1,
          startDate: 1,
          endDate: 1,
          createdAt: 1,
          updatedAt: 1,
          userDetails: {
            _id: 1,
            name: 1,
            email: 1,
            phoneNumber: 1,
            city: 1,
          },
        },
      },
    ]);

    return {
      subscribers,
      totalEarnings: totalEarningsResult[0]?.totalEarnings || 0,
      subscriptions,
    };
  }

  async getAllSubscriptions(user: User) {
    if (user.role === UserRole.ADMIN) return [];

    return await this.subscriptionModel.aggregate([
      {
        $match: {
          transactionId: { $in: [null, ''] },
          subscriptionStatus: 'active',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          subscriptionName: 1,
          plan: 1,
          duration: 1,
          description: 1,
          createdBy: 1,
          subscriptionStatus: 1,
          price: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
  }

  async deleteSubscription(id: string) {
    return await this.subscriptionModel.findByIdAndDelete({
      _id: new Types.ObjectId(id),
    });
  }

  async updateSubscription(id: string, payload: UpdateSubscriptionDto) {
    return await this.subscriptionModel.findByIdAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: payload },
      { new: true },
    );
  }

  async getSubscriptionById(id: string) {
    const result = await this.subscriptionModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(id) },
      },
      {
        $project: {
          _id: 1,
          subscriptionName: 1,
          plan: 1,
          duration: 1,
          description: 1,
          subscriptionStatus: 1,
          price: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return result[0];
  }
}
