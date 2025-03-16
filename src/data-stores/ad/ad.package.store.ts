import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetSubscriptionListQueryDto } from 'src/admin/subscriptions/dtos';
import { IAdPackage } from 'src/interfaces/ads';

export class AdPackageStore {
  constructor(
    // @InjectModel('Ad') private adModel: Model<IAd>,
    // @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('AdPackage') private adPackgeModel: Model<IAdPackage>,
  ) {}

  async getPackageList(
    query: GetSubscriptionListQueryDto,
    skip: number,
    currentLimit: number,
  ) {
    const { search, sortType, orderType } = query;

    const matchStage: any = {
      transactionId: { $in: [null, ''] },
    };

    // if (search) {
    //   matchStage.packageNameAr || packageNameEn = { $regex: search, $options: 'i' };
    // }

    const sortStage: Record<string, any> = {};
    if (sortType === 'Newest') sortStage.createdAt = -1;
    else if (sortType === 'Oldest') sortStage.createdAt = 1;
    if (orderType === 'A-Z') sortStage.subscriptionName = 1;
    else if (orderType === 'Z-A') sortStage.subscriptionName = -1;

    const result = await this.adPackgeModel.aggregate([
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
}
