import { Controller, Get, Query } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { GetSubscriptionListQueryDto } from '../subscriptions/dtos';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packageServerice: PackagesService) {}
  
  @Get('used-list')
  async getPackageList(@Query() query: GetSubscriptionListQueryDto) {
    return this.packageServerice.getPackageList(query);
  }
}
