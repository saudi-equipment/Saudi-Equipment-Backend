import { User } from '../../schemas/user/user.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from 'mongoose';
import {
  CreateAdDto,
  GetAllAdQueryDto,
  ReportAdDto,
  UpdateAdDto,
} from 'src/ads/dtos';
import { IAd, IReportAd } from 'src/interfaces/ads';
import { IUser } from 'src/interfaces/user';

@Injectable()
export class AdStore {
  constructor(
    @InjectModel('Ad') private adModel: Model<IAd>,
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('ReportAd') private reportAdModel: Model<IReportAd>,
  ) {}

  async createAds(
    user: User,
    payload: CreateAdDto,
    adId: string,
    uploadedUrls: string[],
  ): Promise<IAd> {
    const newAd = new this.adModel({
      createdBy: user.id,
      adId: adId,
      isPromoted: payload.isFeatured,
      ...payload,
      images: uploadedUrls,
      user: user._id,
    });

    await newAd.save();

    await this.userModel.findByIdAndUpdate(
      user.id,
      { $push: { ads: newAd._id } },
      { new: true },
    );

    return newAd;
  }

  async updateAdStatus(id: string, expiresAt: any) {
    return await this.adModel.findByIdAndUpdate({
      adId: id,
      isPromoted: true,
      premiumExpiry: expiresAt,
    });
  }

  async updateAd(
    id: string,
    user: User,
    payload: UpdateAdDto,
    uploadedUrls?: string[],
  ): Promise<IAd> {
    try {
      const updatedAd = await this.adModel.findByIdAndUpdate(
        { _id: new Types.ObjectId(id), createdBy: user._id },
        {
          $set: {
            isPromoted: payload.isFeatued,
            ...payload,
            images: uploadedUrls || null,
          },
        },
        { new: true },
      );

      return updatedAd;
    } catch (error) {
      console.error('Error in updateAd:', error.message);
      throw new Error(`Failed to update ad: ${error.message}`);
    }
  }

  async updateAdSellStatus(user: User, id: string): Promise<IAd> {
    const existingAd = await this.adModel.findOne({
      _id: new Types.ObjectId(id),
      createdBy: user.id,
    });

    if (!existingAd) {
      throw new Error('Ad not found or unauthorized');
    }

    existingAd.isSold = true;
    existingAd.soldDate = new Date();

    await existingAd.save();
    return existingAd;
  }

  async repostAd(user: User, id: string): Promise<IAd> {
    const existingAd = await this.adModel.findOne({
      _id: new Types.ObjectId(id),
      createdBy: user.id,
    });

    if (existingAd) {
      existingAd.isRenew = true;
      (existingAd.isActive = true), (existingAd.updatedAt = new Date());

      await existingAd.save();
      return existingAd;
    } else {
      throw new NotFoundException('Ad not found');
    }
  }

  async getUserAdsCount(userId: string): Promise<number> {
    return await this.adModel.countDocuments({ createdBy: userId });
  }

  async getAdById(id: string): Promise<IAd> {
    try {
      const ad = await this.adModel.aggregate([
        {
          $match: { _id: new Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            paymentType: 0,
            paymentCompany: 0,
            transactionId: 0,
            category: 1,
            fuelType: 1,
            createdBy: 1,
            condition: 1,
            titleAr: 1,
            titleEn: 1,
            description: 1,
            price: 1,
            currency: 1,
            adId: 1,
            year: 1,
            city: 1,
            isActive: 1,
            isFeatured: 1,
            isPromoted: 1,
            isRenew: 1,
            youTubeLink: 1,
            views: 1,
            images: 1,
            user: {
              _id: 1,
              name: 1,
              email: 1,
              phoneNumber: 1,
              city: 1,
              profilePicture: 1,
              createdAt: 1,
              updatedAt: 1,
              isPremiumUser: 1,
              isVerified: 1,
            },
          },
        },
      ]);

      if (ad.length === 0) {
        throw new Error('Ad not found');
      }

      return ad[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllAdsForAdmin(
    skip: number,
    limit: number,
    query: GetAllAdQueryDto,
  ) {
    const { search, sortType, adStatus, orderType } = query;

    const filters: any = { isActive: { $in: [true, false] } };

    if (search) {
      filters.$or = [
        { titleEn: { $regex: search, $options: 'i' } },
        { titleAr: { $regex: search, $options: 'i' } },
      ];
    }

    if (adStatus !== undefined) {
      filters.isActive = adStatus === 'true';
    }

    const sortStage: Record<string, any> = {};

    if (sortType === 'Newest') {
      sortStage.createdAt = -1;
    } else if (sortType === 'Oldest') {
      sortStage.createdAt = 1;
    }

    if (orderType === 'A-Z') {
      sortStage.titleEn = 1;
    } else if (orderType === 'Z-A') {
      sortStage.titleEn = -1;
    }

    const result = await this.adModel.aggregate([
      {
        $facet: {
          totalAds: [{ $count: 'count' }],
          activeAds: [{ $match: { isActive: true } }, { $count: 'count' }],
          inactiveAds: [{ $match: { isActive: false } }, { $count: 'count' }],
          promotedAds: [{ $match: { isPromoted: true } }, { $count: 'count' }],
          ads: [
            { $match: filters },
            {
              $sort: Object.keys(sortStage).length
                ? sortStage
                : { createdAt: -1 },
            },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                paymentType: 0,
                paymentCompany: 0,
                transactionId: 0,
              },
            },
          ],
        },
      },
    ]);

    return {
      totalAds: result[0]?.totalAds?.[0]?.count || 0,
      activeAds: result[0]?.activeAds?.[0]?.count || 0,
      inactiveAds: result[0]?.inactiveAds?.[0]?.count || 0,
      promotedAds: result[0]?.promotedAds?.[0]?.count || 0,
      ads: result[0]?.ads || [],
    };
  }

  async getAllAd(skip: number, limit: number, query: GetAllAdQueryDto) {
    try {
      const {
        category,
        condition,
        search,
        postedDate,
        city,
        fuelType,
        sortByPrice,
        sortByDate,
        isHome,
        isPromoted,
        userId,
      } = query;

      const filters: any = { isActive: true };

      if (userId) {
        filters.createdBy = { $ne: userId };
      }

      if (category) {
        if (Array.isArray(category)) {
          filters.category = {
            $in: category.map((cat) => new RegExp(cat, 'i')),
          };
        } else {
          filters.category = { $regex: new RegExp(category, 'i') };
        }
      }

      if (condition) {
        if (Array.isArray(condition)) {
          filters.condition = {
            $in: condition.map((cond) => new RegExp(cond, 'i')),
          };
        } else {
          filters.condition = { $regex: new RegExp(condition, 'i') };
        }
      }

      if (fuelType) {
        if (Array.isArray(fuelType)) {
          filters.fuelType = {
            $in: fuelType.map((fuel) => new RegExp(fuel, 'i')),
          };
        } else {
          filters.fuelType = { $regex: new RegExp(fuelType, 'i') };
        }
      }

      if (search) {
        filters.$or = [
          { titleEn: { $regex: search, $options: 'i' } },
          { titleAr: { $regex: search, $options: 'i' } },
        ];
      }

      if (city) {
        filters.city = { $regex: new RegExp(city, 'i') };
      }

      if (isPromoted) {
        filters.isPromoted = isPromoted;
      }

      if (postedDate) {
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        const dateRanges: Record<string, () => void> = {
          All: () => {
            startDate = null;
            endDate = null;
          },
          'Last 1 days': () => {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
          },
          'Last 30 days': () => {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
          },
          'Last month': () => {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          },
          'Last year': () => {
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            endDate = new Date(now.getFullYear() - 1, 11, 31);
          },
        };

        if (dateRanges[postedDate]) dateRanges[postedDate]();
        if (startDate || endDate) {
          filters.createdAt = {
            ...(startDate && { $gte: startDate }),
            ...(endDate && { $lte: endDate }),
          };
        }
      }

      const promotedAdsPipeline: any[] = [
        { $match: { isPromoted: true, isActive: true } },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            paymentType: 0,
            paymentCompany: 0,
            transactionId: 0,
          },
        },
      ];

      // Original pipeline with filters
      const regularAdsPipeline: any[] = [
        { $match: filters },
        {
          $addFields: {
            priceNumeric: {
              $convert: {
                input: '$price',
                to: 'double',
                onError: null,
                onNull: null,
              },
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
            ...(sortByPrice === 'asc' ? { priceNumeric: 1 } : {}),
            ...(sortByPrice === 'desc' ? { priceNumeric: -1 } : {}),
            ...(sortByDate === 'newest' ? { createdAt: -1 } : {}),
            ...(sortByDate === 'oldest' ? { createdAt: 1 } : {}),
          },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            priceNumeric: 0,
            paymentType: 0,
            paymentCompany: 0,
            transactionId: 0,
          },
        },
      ];

      const totalCountPipeline: any[] = [
        { $match: filters },
        { $count: 'totalAds' },
      ];
      const totalCountResult = await this.adModel.aggregate(totalCountPipeline);
      const totalAds = totalCountResult[0]?.totalAds || 0;

      const [promotedAds, regularAds] = await Promise.all([
        this.adModel.aggregate(promotedAdsPipeline),
        this.adModel.aggregate(regularAdsPipeline),
      ]);

      if (isHome) {
        const homePipeline = [
          {
            $facet: {
              promotedAds: [{ $match: { isPromoted: true } }, { $limit: 4 }],
              saleAds: [
                { $match: { category: { $regex: /Sale/i } } },
                { $limit: 4 },
              ],
              rentAds: [
                { $match: { category: { $regex: /Rent/i } } },
                { $limit: 4 },
              ],
              demandAds: [
                { $match: { category: { $regex: /Demand/i } } },
                { $limit: 4 },
              ],
            },
          },
        ];

        const result = await this.adModel.aggregate(homePipeline);
        return {
          totalAds,
          promotedAds: result[0]?.promotedAds || [],
          saleAds: result[0]?.saleAds || [],
          rentAds: result[0]?.rentAds || [],
          demandAds: result[0]?.demandAds || [],
        };
      } else {
        return {
          totalAds,
          ads: [...promotedAds, ...regularAds], 
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getMyAds(user: User): Promise<IAd[]> {
    try {
      return this.adModel
        .aggregate([
          { $match: { createdBy: user.id } },
          { $sort: { createdAt: -1 } },
        ])
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async deleteAd(id: string) {
    try {
      return await this.adModel.findOneAndDelete({
        _id: id,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUserAds(user: User) {
    return await this.adModel.deleteMany({ createdBy: user.id });
  }

  async reportAd(
    adId: string,
    userId: string,
    payload: ReportAdDto,
  ): Promise<IReportAd> {
    try {
      const reportedAd = new this.reportAdModel({
        reportedBy: userId,
        adId: adId,
        user: new Types.ObjectId(userId),
        ...payload,
      });

      await reportedAd.save();

      const result = await this.reportAdModel.aggregate([
        {
          $match: { _id: reportedAd._id },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            reportedBy: 1,
            reportType: 1,
            adId: 1,
            message: 1,
            reporterName: '$user.name',
            reporterEmail: '$user.email',
            reporterPhoneNumber: '$user.phoneNumber',
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async expireUserAds(userId: string) {
    try {
      const currentDate = new Date();
      const result = await this.adModel.updateMany(
        {
          createdBy: userId,
          promotionEndDate: { $lt: currentDate },
          isPromoted: true,
        },
        { $set: { isPromoted: false } },
      );

      return result;
    } catch (error) {
      throw error;
    }
  }
}
