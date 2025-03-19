import { Injectable, NotFoundException } from '@nestjs/common';
import { GetSubscriptionListQueryDto } from '../subscriptions/dtos';
import { getPagination } from 'src/utils';
import { AdPackageStore } from 'src/data-stores/ad';
import { CreateAdPackageDto, UpdateAdPackageDto } from './dtos';
import { User } from 'src/schemas/user/user.schema';

@Injectable()
export class PackagesService {
  constructor(private readonly packageStore: AdPackageStore) {}

  async getPackageList(query: GetSubscriptionListQueryDto) {
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

  async updatePackage(id: string, payload: UpdateAdPackageDto) {
    return await this.packageStore.updatePackage(id, payload);
  }

  async createAdPackage(user: User, payload: CreateAdPackageDto) {
    return await this.packageStore.createPackage(user, payload);
  }

  async getPackageById(id: string) {
    return await this.packageStore.getPackageById(id);
  }

  async deletePackage(id: string) {
    return await this.packageStore.deletePackage(id);
  }
}
