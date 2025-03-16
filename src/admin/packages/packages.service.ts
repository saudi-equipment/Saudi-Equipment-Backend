import { Injectable, NotFoundException } from '@nestjs/common';
import { GetSubscriptionListQueryDto } from '../subscriptions/dtos';
import { getPagination } from 'src/utils';
import { AdPackageStore } from 'src/data-stores/ad';

@Injectable()
export class PackagesService {
    constructor(private readonly packageStore: AdPackageStore ) {}

    async getPackageList(
        query: GetSubscriptionListQueryDto,
      ) {
        const { page, limit } = query;
        const { skip, limit: currentLimit } = getPagination({ page, limit });
    
        const adPackages = await this.packageStore.getPackageList(
          query,
          skip,
          currentLimit,
        );
    
        if (!adPackages) {
          throw new NotFoundException('Packages not found');
        }
    
        return adPackages;
      }
    
}
