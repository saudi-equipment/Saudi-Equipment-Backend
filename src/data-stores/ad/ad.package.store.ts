import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateAdPackageDto,
  UpdateAdPackageDto,
} from 'src/admin/packages/dtos';
import { GetSubscriptionListQueryDto } from 'src/admin/subscriptions/dtos';
import { IAdPackage } from 'src/interfaces/ads';
import { User } from 'src/schemas/user/user.schema';

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

    const matchStage: any = {};

    if (search) {
      matchStage.$or = [
        { packageNameAr: { $regex: search, $options: 'i' } },
        { packageNameEn: { $regex: search, $options: 'i' } },
      ];
    }

    const sortStage: Record<string, any> = {};
    if (sortType === 'Newest') sortStage.createdAt = -1;
    else if (sortType === 'Oldest') sortStage.createdAt = 1;
    if (orderType === 'A-Z') sortStage.packageNameEn = 1;
    else if (orderType === 'Z-A') sortStage.packageNameEn = -1;

    const result = await this.adPackgeModel.aggregate([
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'totalPackages' }],
          packages: [
            {
              $sort: Object.keys(sortStage).length
                ? sortStage
                : { createdAt: -1 },
            },
            { $skip: skip },
            { $limit: currentLimit },
          ],
        },
      },
    ]);

    const metadata = result[0]?.metadata[0] || { totalPackages: 0 };

    return {
      totalPackages: metadata.totalPackages,
      packages: result[0]?.packages || [],
    };
  }

  async updatePackage(id: string, payload: UpdateAdPackageDto) {
    return await this.adPackgeModel.findByIdAndUpdate(
      {_id: new Types.ObjectId(id)},
      { $set: payload },
      { new: true },
    );
  }

  async createPackage(user: User, payload: CreateAdPackageDto) {
    const adPackage = new this.adPackgeModel({
      ...payload,
      createdBy: user.id,
    });

    return adPackage.save(); 
  }

  async getPackageById(id: string) {
    return await this.adPackgeModel.findOne({
      _id: new Types.ObjectId(id),
    });
  }

  async deletePackage(id: string) {
    return await this.adPackgeModel.findByIdAndDelete({
      _id: new Types.ObjectId(id),
    });
  }
}
