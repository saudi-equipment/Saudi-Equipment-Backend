import { BannerAd } from 'src/schemas/banner.ad/banner.ad.schema';

export interface IBannerAd extends BannerAd {
  bannerAdName: string;
  bannerImages: string[];
  bannerAdLink: string;
  bannerAdId: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

