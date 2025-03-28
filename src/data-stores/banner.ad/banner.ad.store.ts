import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types} from 'mongoose';
import { CommonQueryDto } from 'src/common/dtos';
import { CreateBannerAdDto, UpdateBannerAdDto } from 'src/google.ad/dtos';
import { IBannerAd } from 'src/interfaces/banner.ad';
import { User } from 'src/schemas/user/user.schema';

@Injectable()
export class BannerStore {
  constructor(
    @InjectModel('BannerAd') private bannerAdModel: Model<IBannerAd>,
  ) {}

  async createBannerAd(
    user: User,
    payload: CreateBannerAdDto,
    bannerAdId: string,
    uploadedUrls: string[],
  ): Promise<IBannerAd> {
    const newBannerAd = new this.bannerAdModel({
      createdBy: user.id,
      bannerAdId,
      ...payload,
      bannerImages: uploadedUrls,
      user: user._id,
    });

    await newBannerAd.save();
    return newBannerAd;
  }

  async getBannerAdById(id: string): Promise<IBannerAd | null> {
    return this.bannerAdModel.findById(id).exec();
  }

  async updateBannerAd(
    id: string,
    payload: UpdateBannerAdDto,
    bannerImages?: string[],
  ): Promise<IBannerAd> {
    try {
      const updateData: any = {
        ...payload,
      };

      if (bannerImages) {
        updateData.bannerImages = bannerImages;
      }

      const updatedBanner = await this.bannerAdModel
        .findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true })
        .exec();

      return updatedBanner;
    } catch (error) {
      console.error('Error in updateBannerAd:', error);
      throw error;
    }
  }

  async getAllBannerAds(
    query: CommonQueryDto,
    skip: number,
    currentLimit: number,
  ): Promise<{
    bannerAds: IBannerAd[];
    totalBannerAds: number;
  }> {
    const { search, sortType, orderType } = query;

    const matchStage: any = {};

    if (search) {
      matchStage.$or = [
        { bannerAdName: { $regex: search, $options: 'i' } },
        { bannerAdLink: { $regex: search, $options: 'i' } },
        { bannerAdId: { $regex: search, $options: 'i' } },
      ];
    }

    const sortStage: Record<string, any> = {};

    if (sortType === 'Newest') {
      sortStage.createdAt = -1;
    } else if (sortType === 'Oldest') {
      sortStage.createdAt = 1;
    }

    if (orderType === 'A-Z') {
      sortStage.bannerAdName = 1;
    } else if (orderType === 'Z-A') {
      sortStage.bannerAdName = -1;
    }

    const aggregationPipeline = [
      { $match: matchStage },
      { $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 } },
      {
        $facet: {
          bannerAdList: [
            { $skip: skip },
            { $limit: currentLimit },
            {
              $project: {
                bannerAdName: 1,
                bannerImages: 1,
                bannerAdLink: 1,
                bannerAdId: 1,
                createdBy: 1,
                createdAt: 1
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          bannerAds: '$bannerAdList',
          totalBannerAds: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ];

    const result = await this.bannerAdModel
      .aggregate(aggregationPipeline)
      .exec();

    return {
      totalBannerAds: result[0]?.totalBannerAds || 0,
      bannerAds: result[0]?.bannerAds || [],
    };
  }
  async deleteBannerAd(id: string) {
    try {
      return await this.bannerAdModel.findOneAndDelete({
        _id: id,
      });
    } catch (error) {
      throw error;
    }
  }
}