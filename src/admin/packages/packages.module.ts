import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { AdPackageStore } from 'src/data-stores/ad';
import { MongooseModule } from '@nestjs/mongoose';
import { AdPackage, adsPackageSchema } from 'src/schemas/ad';

@Module({
  imports: [
      MongooseModule.forFeature([
        // { name: Subscription.name, schema: subscriptionSchema },
        { name: AdPackage.name, schema: adsPackageSchema },
      ]),
    ],
  providers: [PackagesService, AdPackageStore],
  controllers: [PackagesController]
})
export class PackagesModule {}
