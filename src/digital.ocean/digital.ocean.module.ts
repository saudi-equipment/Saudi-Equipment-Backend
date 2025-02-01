import { forwardRef, Module } from '@nestjs/common';
import { DigitalOceanService } from './digital.ocean.service';
import { DigitalOceanController } from './digital.ocean.controller';
import { AdModule } from 'src/ads/ad.module';

@Module({
  imports: [forwardRef(() => AdModule)],
  providers: [DigitalOceanService],
  controllers: [DigitalOceanController],
  exports: [DigitalOceanService]
})
export class DigitalOceanModule {}
