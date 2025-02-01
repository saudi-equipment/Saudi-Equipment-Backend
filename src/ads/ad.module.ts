import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { adsSchema } from 'src/schemas/ad/ad.schema';
import { UserModule } from 'src/user/user.module';
import { AdStore } from 'src/data-stores/ad/ad.store';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';
import { userSchema } from 'src/schemas/user/user.schema';
import { ConfigModule } from '@nestjs/config';
import { DigitalOceanModule } from 'src/digital.ocean/digital.ocean.module';
import { reportAdSchema } from 'src/schemas/ad';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => DigitalOceanModule),
    MongooseModule.forFeature([
      { name: 'Ad', schema: adsSchema },
      { name: 'User', schema: userSchema },
      { name: 'ReportAd', schema: reportAdSchema },
    ]),
  ],
  providers: [AdService, AdStore],
  controllers: [AdController],
})
export class AdModule {}
