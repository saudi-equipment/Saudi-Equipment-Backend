import { Module } from '@nestjs/common';
import { BannerAdService } from './banner.ad.service';
import { BannerAdController } from './banner.ad.controller';
import { BannerStore } from 'src/data-stores/banner.ad/banner.ad.store';
import { MongooseModule } from '@nestjs/mongoose';
import { bannerAdSchema } from 'src/schemas/banner.ad/banner.ad.schema';
import { DigitalOceanModule } from 'src/digital.ocean/digital.ocean.module';


@Module({
  imports: [
    DigitalOceanModule,
    MongooseModule.forFeature([{ name: 'BannerAd', schema: bannerAdSchema }]),
  ],
  providers: [BannerAdService, BannerStore],
  controllers: [BannerAdController],
})
export class BannerAdModule {}
