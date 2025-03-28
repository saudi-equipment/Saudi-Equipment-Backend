import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBannerAdDto, UpdateBannerAdDto } from './dtos';
import { User } from 'src/schemas/user/user.schema';
import { IBannerAd } from 'src/interfaces/banner.ad';
import { BannerStore } from 'src/data-stores/banner.ad/banner.ad.store';
import { generateAdId, getPagination } from 'src/utils';
import { DigitalOceanService } from 'src/digital.ocean/digital.ocean.service';
import { CommonQueryDto } from 'src/common/dtos';

@Injectable()
export class BannerAdService {
  constructor(
    private readonly digitalOceanService: DigitalOceanService,
    private readonly bannerAdStore: BannerStore,
  ) {}

  async createBannerAd(
    user: User,
    payload: CreateBannerAdDto,
    files: Express.Multer.File[],
  ) {
    try {
      const bannerAdId = generateAdId();

      const uploadedUrls = await Promise.all(
        files.map((file) => this.digitalOceanService.uploadFileToSpaces(file)),
      );

      const data = await this.bannerAdStore.createBannerAd(
        user,
        payload,
        bannerAdId,
        uploadedUrls,
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateBannerAd(
    id: string,
    payload: UpdateBannerAdDto,
    files?: Express.Multer.File[],
  ): Promise<IBannerAd> {
    try {
      const existingBanner = await this.bannerAdStore.getBannerAdById(id);

      if (!existingBanner) {
        throw new NotFoundException('Banner ad not found');
      }

      // Handle existing images
      let existingImages = existingBanner.bannerImages || [];
      const remainingImages = payload.imageUrls || [];

      // Delete images that were removed
      if (remainingImages.length === 0 && existingImages.length > 0) {
        await this.digitalOceanService.deleteFilesFromSpaces(existingImages);
      } else {
        const imagesToDelete = existingImages.filter(
          (image) => !remainingImages.includes(image),
        );
        if (imagesToDelete.length > 0) {
          await this.digitalOceanService.deleteFilesFromSpaces(imagesToDelete);
        }
      }

      // Upload new files
      const newUploadedUrls =
        files && files.length > 0
          ? await Promise.all(
              files.map((file) =>
                this.digitalOceanService.uploadFileToSpaces(file),
              ),
            )
          : [];

      // Combine kept and new images
      const updatedImages = [...remainingImages, ...newUploadedUrls];

      return await this.bannerAdStore.updateBannerAd(
        id,
        payload,
        updatedImages,
      );
    } catch (error) {
      console.error('Error updating banner ad:', error);
      throw new Error(`Failed to update banner ad: ${error.message}`);
    }
  }

  async getAllBannerAds(query: CommonQueryDto) {
    try {
      const { page, limit } = query;
      const { skip, limit: currentLimit } = getPagination({ page, limit });

      const result = await this.bannerAdStore.getAllBannerAds(
        query,
        skip,
        currentLimit,
      );

      if (!result) {
        throw new NotFoundException('Banner ads not found');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteBannerAd(id: string) {
    try {
      return await this.bannerAdStore.deleteBannerAd(id);
    } catch (error) {
      error;
    }
  }
  //   // Read (single with aggregation)
  //   async findOneWithDetails(id: string): Promise<IGoogleAd> {
  //     const result = await this.googleAdModel
  //       .aggregate([
  //         { $match: { _id: new Types.ObjectId(id) } },
  //         {
  //           $lookup: {
  //             from: 'users',
  //             localField: 'user',
  //             foreignField: '_id',
  //             as: 'user',
  //           },
  //         },
  //         { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  //         { $limit: 1 },
  //       ])
  //       .exec();

  //     return result[0] ? this.transformAd(result[0]) : null;
  //   }

  //   // Read (all with pagination and filtering)
  //   async findAll(
  //     page: number = 1,
  //     limit: number = 10,
  //     filters: Record<string, any> = {},
  //   ): Promise<{ data: IGoogleAd[]; total: number }> {
  //     const skip = (page - 1) * limit;

  //     const [data, total] = await Promise.all([
  //       this.googleAdModel
  //         .aggregate([
  //           { $match: filters },
  //           {
  //             $lookup: {
  //               from: 'users',
  //               localField: 'user',
  //               foreignField: '_id',
  //               as: 'user',
  //             },
  //           },
  //           { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  //           { $skip: skip },
  //           { $limit: limit },
  //           { $sort: { createdAt: -1 } },
  //         ])
  //         .exec(),
  //       this.googleAdModel.countDocuments(filters).exec(),
  //     ]);

  //     return {
  //       data: data.map(this.transformAd),
  //       total,
  //     };
  //   }

  //   // Update
  //   async update(
  //     id: string,
  //     updateGoogleAdDto: UpdateGoogleAdDto,
  //   ): Promise<IGoogleAd> {
  //     const updateData: any = { ...updateGoogleAdDto };

  //     if (updateGoogleAdDto.userId) {
  //       updateData.user = new Types.ObjectId(updateGoogleAdDto.userId);
  //       delete updateData.userId;
  //     }

  //     const updated = await this.googleAdModel
  //       .findByIdAndUpdate(id, updateData, { new: true })
  //       .exec();

  //     return updated ? this.findOneWithDetails(id) : null;
  //   }

  //   // Delete
  //   async delete(id: string): Promise<IGoogleAd> {
  //     const ad = await this.findOneWithDetails(id);
  //     if (ad) {
  //       await this.googleAdModel.deleteOne({ _id: id }).exec();
  //     }
  //     return ad;
  //   }

  //   // Helper to transform the aggregated result
  //   private transformAd(ad: any): IGoogleAd {
  //     return {
  //       _id: ad._id.toString(),
  //       header: ad.header,
  //       footer: ad.footer,
  //       inside: ad.inside,
  //       adDetails: ad.adDetails,
  //       createdBy: ad.createdBy,
  //       user: ad.user
  //         ? {
  //             _id: ad.user._id.toString(),
  //             // Add other user fields you want to expose
  //             // username: ad.user.username,
  //             // email: ad.user.email,
  //           }
  //         : undefined,
  //       createdAt: ad.createdAt,
  //       updatedAt: ad.updatedAt,
  //     };
  //   }
}
