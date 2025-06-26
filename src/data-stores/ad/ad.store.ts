import { User } from '../../schemas/user/user.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    transactionId?: string,
  ): Promise<IAd> {
    const newAd = new this.adModel({
      createdBy: user.id,
      adId: adId,
      isPromoted: payload.isFeatured,
      transactionId: transactionId,
      promotionStartDate: payload.startDate,
      promotionEndDate: payload.endDate,
      promotionPlan: payload.promotionPlan,
      promotionPrice: payload.promotionPrice,
      duration: payload.duration,
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
    transactionId?: string,
  ): Promise<IAd> {
    try {
      const updatedAd = await this.adModel.findByIdAndUpdate(
        { _id: new Types.ObjectId(id), createdBy: user._id },
        {
          $set: {
            isPromoted: payload.isFeatured,
            promotionStartDate: payload.startDate,
            promotionEndDate: payload.endDate,
            transactionId: transactionId,
            promotionPrice: payload.promotionPrice,
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
    (existingAd.isActive = false),
      (existingAd.isPromoted = false),
      (existingAd.isSold = true);
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

  async getAdsByIds(ids: string[]): Promise<IAd[]> {
    return await this.adModel
      .find({
        _id: { $in: ids },
      })
      .exec();
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
            promotionPrice: 1,
            promotionPlan: 1,
            paymentCompany: 1,
            paymentType: 1,
            duration: 1,
            startDate: 1,
            endDate: 1,
            isPromoted: 1,
            isRenew: 1,
            youTubeLink: 1,
            views: 1,
            images: 1,
            createdAt: 1,
            updatedAt: 1,
            'user._id': 1,
            'user.name': 1,
            'user.email': 1,
            'user.phoneNumber': 1,
            'user.city': 1,
            'user.profilePicture': 1,
            'user.createdAt': 1,
            'user.updatedAt': 1,
            'user.isPremiumUser': 1,
            'user.isVerified': 1,
          },
        },
      ]);

      await this.adModel.updateOne(
        { _id: new Types.ObjectId(id) },
        { $inc: { views: 1 } },
      );

      return ad[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllReportedAds(
    query: GetAllAdQueryDto,
    skip: number,
    currentLimit: number,
  ): Promise<{
    reports: IReportAd[];
    totalReports: number;
  }> {
    const { search, sortType, orderType } = query;

    const matchStage: any = {};

    if (search) {
      matchStage.$or = [
        { reportedBy: { $regex: search, $options: 'i' } },
        { reportType: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const sortStage: Record<string, any> = {};

    if (sortType === 'Newest') {
      sortStage.createdAt = -1;
    } else if (sortType === 'Oldest') {
      sortStage.createdAt = 1;
    }

    if (orderType === 'A-Z') {
      sortStage.reportedBy = 1;
    } else if (orderType === 'Z-A') {
      sortStage.reportedBy = -1;
    }

    const aggregationPipeline = [
      { $match: matchStage },
      { $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 } },
      {
        $facet: {
          reportList: [
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
            {
              $lookup: {
                from: 'ads',
                localField: 'ad',
                foreignField: '_id',
                as: 'ad',
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$ad', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                reportedBy: 1,
                reportType: 1,
                adId: 1,
                createdAt: 1,
                updatedAt: 1,
                message: 1,
                'user._id': 1,
                'user.name': 1,
                'user.email': 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          reports: '$reportList',
          totalReports: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ];

    const result = await this.reportAdModel
      .aggregate(aggregationPipeline)
      .exec();

    return {
      totalReports: result[0]?.totalReports || 0,
      reports: result[0]?.reports || [],
    };
  }

  async getAllAdsForAdmin(
    skip: number,
    limit: number,
    query: GetAllAdQueryDto,
  ) {
    const { search, sortType, adStatus, orderType, isPromoted } = query;

    const baseFilters: any = { isActive: { $in: [true, false] } };

    if (adStatus !== undefined) {
      baseFilters.isActive = adStatus === 'true';
    }

    if (isPromoted) {
      baseFilters.isPromoted = true;
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
      { $match: baseFilters },
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
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { titleEn: { $regex: search, $options: 'i' } },
                  { titleAr: { $regex: search, $options: 'i' } },
                  { adId: { $regex: search, $options: 'i' } },
                  { category: { $regex: search, $options: 'i' } },
                  { fuelType: { $regex: search, $options: 'i' } },
                  { condition: { $regex: search, $options: 'i' } },
                  { description: { $regex: search, $options: 'i' } },
                  { price: { $regex: search, $options: 'i' } },
                  { currency: { $regex: search, $options: 'i' } },
                  { year: { $regex: search, $options: 'i' } },
                  { city: { $regex: search, $options: 'i' } },
                  { duration: { $regex: search, $options: 'i' } },
                  { 'userDetails.email': { $regex: search, $options: 'i' } },
                  { 'userDetails.name': { $regex: search, $options: 'i' } },
                  {
                    'userDetails.phoneNumber': {
                      $regex: search,
                      $options: 'i',
                    },
                  },
                ],
              },
            },
          ]
        : []),
      {
        $facet: {
          totalAds: [{ $count: 'count' }],
          activeAds: [{ $match: { isActive: true } }, { $count: 'count' }],
          inactiveAds: [{ $match: { isActive: false } }, { $count: 'count' }],
          promotedAds: [{ $match: { isPromoted: true } }, { $count: 'count' }],
          ads: [
            {
              $sort: Object.keys(sortStage).length
                ? sortStage
                : { createdAt: -1 },
            },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                category: 1,
                fuelType: 1,
                condition: 1,
                titleAr: 1,
                titleEn: 1,
                description: 1,
                price: 1,
                currency: 1,
                year: 1,
                city: 1,
                adId: 1,
                isActive: 1,
                isPromoted: 1,
                promotionPlan: 1,
                promotionStartDate: 1,
                promotionEndDate: 1,
                isSold: 1,
                soldDate: 1,
                views: 1,
                images: 1,
                createdAt: 1,
                updatedAt: 1,
                userDetails: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                },
              },
            },
          ],
        },
      },
    ]);

    const totalAds = result[0]?.totalAds?.[0]?.count || 0;
    const activeAds = result[0]?.activeAds?.[0]?.count || 0;
    const inactiveAds = result[0]?.inactiveAds?.[0]?.count || 0;
    const promotedAds = result[0]?.promotedAds?.[0]?.count || 0;
    const ads = result[0]?.ads || [];

    return {
      totalAds,
      activeAds,
      inactiveAds,
      promotedAds,
      ads,
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

      // if (userId) {
      //   filters.createdBy = { $ne: userId };
      // }

      const currentUser = await this.userModel
        .findById(userId)
        .select('blockedUsers');
      const blockedUserIds = currentUser?.blockedUsers || [];

      if (blockedUserIds.length > 0) {
        filters.createdBy = { ...filters.createdBy, $nin: blockedUserIds };
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
          { adId: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { fuelType: { $regex: search, $options: 'i' } },
        ];
      }

      const cityFilter =
        city && city.toLowerCase() !== 'saudi-arabia'
          ? { city: { $regex: new RegExp(city, 'i') } }
          : {};

      if (isPromoted) {
        filters.isPromoted = true;
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

      const promotedFilters = { ...filters, isPromoted: true };
      const regularFilters = { ...filters, isPromoted: false, ...cityFilter };

      const pipeline: any[] = [
        {
          $match: {
            $or: [promotedFilters, regularFilters],
          },
        },
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
            isPromoted: -1,
            createdAt: -1,
            ...(sortByPrice === 'asc' ? { priceNumeric: 1 } : {}),
            ...(sortByPrice === 'desc' ? { priceNumeric: -1 } : {}),
            ...(sortByDate === 'newest' ? { createdAt: -1 } : {}),
            ...(sortByDate === 'oldest' ? { createdAt: 1 } : {}),
          },
        },
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

      if (isHome) {
        pipeline.push({
          $facet: {
            promotedAds: [{ $match: promotedFilters }, { $limit: 8 }],
            saleAds: [
              { $match: { ...regularFilters, category: { $regex: /Sale/i } } },
              { $limit: 8 },
            ],
            rentAds: [
              { $match: { ...regularFilters, category: { $regex: /Rent/i } } },
              { $limit: 8 },
            ],
            demandAds: [
              {
                $match: { ...regularFilters, category: { $regex: /Demand/i } },
              },
              { $limit: 8 },
            ],
          },
        });

        const result = await this.adModel.aggregate(pipeline);
        return {
          totalAds,
          promotedAds: result[0]?.promotedAds || [],
          saleAds: result[0]?.saleAds || [],
          rentAds: result[0]?.rentAds || [],
          demandAds: result[0]?.demandAds || [],
        };
      } else {
        pipeline.push(
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              user: 0,
            },
          },
        );

        const result = await this.adModel.aggregate(pipeline);
        return {
          totalAds,
          ads: result,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getMyAds(user: User): Promise<IAd[]> {
    try {
      return this.adModel.aggregate([
        // 1. Match ads created by the user
        { $match: { createdBy: user.id } },

        // 2. Lookup adPromotion for each ad
        {
          $lookup: {
            from: 'adpromotions',
            localField: '_id',
            foreignField: 'ad',
            as: 'adpromotion',
          },
        },
        { $unwind: { path: '$adpromotion', preserveNullAndEmptyArrays: true } },

        // 3. Only perform payment transaction lookup for promoted ads
        {
          $lookup: {
            from: 'paymenttransactions',
            let: { adPromotionId: '$adpromotion._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$adPromotion', '$$adPromotionId'] },
                      { $ifNull: ['$$adPromotionId', false] }, // Only match if adPromotionId exists
                    ],
                  },
                },
              },
            ],
            as: 'paymenttransaction',
          },
        },
        { $unwind: { path: '$paymenttransaction', preserveNullAndEmptyArrays: true } },

        // 4. Clean up the output
        {
          $project: {
            '__v': 0,
            'adpromotion.__v': 0,
            'adpromotion.ad': 0,
            'adpromotion.user': 0,
            'paymenttransaction.__v': 0,
            'paymenttransaction.adPromotion': 0,
            'paymenttransaction.user': 0,
            'paymenttransaction.adpromotion': 0,
          },
        },

        // 5. Sort by creation
        { $sort: { createdAt: -1 } },
      ]).exec();
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

  async deleteManyAds(ids: string[]) {
    try {
      return await this.adModel.deleteMany({
        _id: { $in: ids },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUserAds(id: string) {
    return await this.adModel.deleteMany({ createdBy: id });
  }

  async findExistingAdByReportedAdId(adId: string) {
    return await this.adModel.findOne({
      adId: adId,
    });
  }

  async reportAd(
    adId: string,
    userId: string,
    payload: ReportAdDto,
  ): Promise<IReportAd> {
    try {
      const reportedAd = new this.reportAdModel({
        reportedBy: userId,
        ad: new Types.ObjectId(adId),
        user: new Types.ObjectId(userId),
        ...payload,
      });

      await reportedAd.save();
      return reportedAd;
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

  async findAllAds(user: User) {
    return await this.adModel.find({ createdBy: user.id });
  }
}
