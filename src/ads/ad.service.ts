import { User } from '../schemas/user/user.schema';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateAdDto,
  GetAllAdQueryDto,
  ReportAdDto,
  UpdateAdDto,
} from './dtos';
import { AdStore } from 'src/data-stores/ad/ad.store';
import { IAd, IReportAd } from 'src/interfaces/ads';
import { getPagination } from 'src/utils/pagination.helper';
import { DigitalOceanService } from 'src/digital.ocean/digital.ocean.service';
import { generateAdId } from 'src/utils';

@Injectable()
export class AdService {
  constructor(
    private readonly adStore: AdStore,
    private readonly digitalOceanService: DigitalOceanService,
  ) {}

  async createAd(
    user: User,
    payload: CreateAdDto,
    files: Express.Multer.File[],
  ) {
    try {
      const adId = generateAdId();

      if (user.isPremiumUser === true) {
        const uploadedUrls = await Promise.all(
          files.map((file) =>
            this.digitalOceanService.uploadFileToSpaces(file),
          ),
        );

        const data = await this.adStore.createAds(
          user,
          payload,
          adId,
          uploadedUrls,
        );
        return data;
      } else {
        const uploadedUrls = await Promise.all(
          files.map((file) =>
            this.digitalOceanService.uploadFileToSpaces(file),
          ),
        );

        const userAdsCount = await this.adStore.getUserAdsCount(user.id);

        if (userAdsCount >= 3) {
          throw new Error(' free users can only create up to 3 ads.');
        }

        const data = await this.adStore.createAds(
          user,
          payload,
          adId,
          uploadedUrls,
        );
        return data;
      }
    } catch (error) {
      throw error;
    }
  }

  async updateAd(
    id: string,
    user: User,
    payload: UpdateAdDto,
    files?: Express.Multer.File[],
  ): Promise<IAd> {
    try {
      console.log("File", files)
      const existingAd = await this.adStore.getAdById(id);

      if (!existingAd) {
        throw new NotFoundException('Ad not found');
      }

      let existingImages = existingAd.images || [];
      const remainingImages = payload.imageUrls || [];

      if (remainingImages.length === 0) {
        if (existingImages.length > 0) {
          await this.digitalOceanService.deleteFilesFromSpaces(existingImages);
        }

        await this.adStore.updateAd(id, user, payload, []);
      } else {
        const imagesToDelete = existingImages.filter(
          (image) => !remainingImages.includes(image),
        );
        if (imagesToDelete.length > 0) {
          await this.digitalOceanService.deleteFilesFromSpaces(imagesToDelete);
        }
      }

      const newUploadedUrls =
        files && files.length > 0
          ? await Promise.all(
              files.map((file) =>
                this.digitalOceanService.uploadFileToSpaces(file),
              ),
            )
          : [];

      const updatedImages = [...remainingImages, ...newUploadedUrls];
      const updatedAd = await this.adStore.updateAd(
        id,
        user,
        payload,
        updatedImages,
      );

      return updatedAd;
    } catch (error) {
      console.error('Error in updateAd:', error.message);
      throw new Error(`Failed to update ad: ${error.message}`);
    }
  }

  async deleteAd(id: string) {
    try {
      return await this.adStore.deleteAd(id);
    } catch (error) {
      error;
    }
  }

  async reportAd(
    adId: string,
    userId: string,
    payload: ReportAdDto,
  ): Promise<IReportAd> {
    try {
      const ad = await this.adStore.getAdById(adId);

      if (!ad) {
        throw new NotFoundException('Ad not found');
      }

      if (ad.createdBy.toString() === userId) {
        throw new ForbiddenException('You cannot report your own ad');
      }

      return await this.adStore.reportAd(adId, userId, payload);
    } catch (error) {
      throw error;
    }
  }

  async getAllReportedAds(query: GetAllAdQueryDto) {
    try {
      const { page, limit } = query;
      const { skip, limit: currentLimit } = getPagination({ page, limit });

      const ads = await this.adStore.getAllReportedAds(
        query,
        skip,
        currentLimit,
      );

      if (!ads) {
        throw new NotFoundException('Ads not found');
      }

      return ads;
    } catch (error) {
      throw error;
    }
  }

  async getAdById(id: string) {
    try {
      const ad = await this.adStore.getAdById(id);

      if (!ad) {
        throw new NotFoundException('Ad not found');
      }

      return ad;
    } catch (error) {
      throw error;
    }
  }

  async repostAd(user: User, id: string): Promise<IAd> {
    try {
      const repostAd = await this.adStore.repostAd(user, id);
      return repostAd;
    } catch (error) {
      throw error;
    }
  }

  async updateAdSellStatus(user: User, id: string): Promise<IAd> {
    try {
      const repostAd = await this.adStore.updateAdSellStatus(user, id);
      return repostAd;
    } catch (error) {
      throw error;
    }
  }

  async getAllAd(query: GetAllAdQueryDto) {
    try {
      const { page, limit } = query;
      const { skip, limit: currentLimit } = getPagination({ page, limit });
      const result = await this.adStore.getAllAd(skip, currentLimit, query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllAdsForAdmin(query: GetAllAdQueryDto) {
    try {
      const { page, limit } = query;
      const { skip, limit: currentLimit } = getPagination({ page, limit });
      const result = await this.adStore.getAllAdsForAdmin(
        skip,
        currentLimit,
        query,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMyAds(user: User): Promise<IAd[]> {
    try {
      const ad = await this.adStore.getMyAds(user);
      return ad;
    } catch (error) {
      throw error;
    }
  }

  async expireUserAds(userId: string) {
    const result = await this.adStore.expireUserAds(userId);
    return result;
  }
}
