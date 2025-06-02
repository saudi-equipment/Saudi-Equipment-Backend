import { User } from '../schemas/user/user.schema';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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
import { checkDuplicateImages, generateAdId } from 'src/utils';
import { generateTransactionId } from 'src/utils/generate.transaction.id.helper';

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
      const userAds = await this.adStore.findAllAds(user);
      const images = userAds.flatMap((ad) => ad.images);

      const duplicates = checkDuplicateImages(files, images);

      if (duplicates.length > 0) {
        throw new Error(
          'Image duplication error, please upload different images.',
        );
      }

      const adId = generateAdId();
      let transactionId: string | undefined;
      if (user.isPremiumUser === true) {
        const uploadedUrls = await Promise.all(
          files.map((file) =>
            this.digitalOceanService.uploadFileToSpaces(file),
          ),
        );

        if (payload.isFeatured) {
          transactionId = generateTransactionId();
        }

        const data = await this.adStore.createAds(
          user,
          payload,
          adId,
          uploadedUrls,
          transactionId,
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
          undefined,
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
      let transactionId: string | undefined;

      if (user.isPremiumUser === true && payload.isFeatured === true) {
        transactionId = generateTransactionId();
      }

      const updatedAd = await this.adStore.updateAd(
        id,
        user,
        payload,
        updatedImages,
        transactionId,
      );

      return updatedAd;
    } catch (error) {
      console.error('Error in updateAd:', error.message);
      throw new Error(`Failed to update ad: ${error.message}`);
    }
  }

  async deleteAd(id: string): Promise<boolean> {
    const adToDelete = await this.adStore.getAdById(id);

    if (!adToDelete) {
      throw new NotFoundException('Ad not found');
    }

    // Delete images from Digital Ocean if they exist
    if (adToDelete.images && adToDelete.images.length > 0) {
      try {
        await this.digitalOceanService.deleteFilesFromSpaces(adToDelete.images);
      } catch (error) {
        console.error('Error deleting images from Digital Ocean:', error);
      }
    }

    // Delete the ad from database
    const deletionResult = await this.adStore.deleteAd(id);

    if (!deletionResult) {
      throw new Error('Failed to delete ad from database');
    }

    return true;
  }

  async deleteManyAds(ids: string[]): Promise<boolean> {
    const adsToDelete = await this.adStore.getAdsByIds(ids);

    if (!adsToDelete || adsToDelete.length === 0) {
      throw new NotFoundException('Ads not found');
    }

    const allImageUrls: string[] = [];
    adsToDelete.forEach((ad) => {
      if (ad.images && ad.images.length > 0) {
        allImageUrls.push(...ad.images);
      }
    });

    if (allImageUrls.length > 0) {
      try {
        await this.digitalOceanService.deleteFilesFromSpaces(allImageUrls);
      } catch (error) {
        console.error('Error deleting images from Digital Ocean:', error);
      }
    }

    const deletionResult = await this.adStore.deleteManyAds(ids);

    if (!deletionResult) {
      throw new Error('Failed to delete ads from database');
    }

    return true;
  }

  async reportAd(
    adId: string,
    userId: string,
    payload: ReportAdDto,
  ): Promise<IReportAd> {
    try {
      const findExistingAdByReportedAdId =
        await this.adStore.findExistingAdByReportedAdId(payload.adId);

      if (!findExistingAdByReportedAdId) {
        throw new NotFoundException(
          'Ad not found, Please send the adId eg: 91405913',
        );
      }

      if (findExistingAdByReportedAdId.createdBy.toString() === userId) {
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
