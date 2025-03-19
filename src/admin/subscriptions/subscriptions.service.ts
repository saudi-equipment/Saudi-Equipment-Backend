import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionStore } from 'src/data-stores/subscripions/subscriptions.store';
import {
  CreateSubscriptionDto,
  GetSubscriptionListQueryDto,
  UpdateSubscriptionDto,
} from './dtos';
import { User } from 'src/schemas/user/user.schema';
import { getPagination } from 'src/utils';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly subscriptionStore: SubscriptionStore) {}

  async createSubscription(user: User, payload: CreateSubscriptionDto) {
    return await this.subscriptionStore.createSubscription(user, payload);
  }

  async getAllSubscriptionsForPublic(user: User) {
    return await this.subscriptionStore.getAllSubscriptions(user);
  }

  async getAllSubscriptionsList(query: GetSubscriptionListQueryDto) {
    const { page, limit } = query;
    const { skip, limit: currentLimit } = getPagination({ page, limit });

    const subscritions = await this.subscriptionStore.getAllSubscriptionsList(
      query,
      skip,
      currentLimit,
    );

    if (!subscritions) {
      throw new NotFoundException('Subscritions not found');
    }

    return subscritions;
  }

  async usedSubscriptionsList(query: GetSubscriptionListQueryDto) {
    const { page, limit } = query;
    const { skip, limit: currentLimit } = getPagination({ page, limit });

    const subscritions = await this.subscriptionStore.usedSubscriptionsList(
      query,
      skip,
      currentLimit,
    );

    if (!subscritions) {
      throw new NotFoundException('Subscritions not found');
    }

    return subscritions;
  }

  async getAllPackages() {
    return await this.subscriptionStore.getAllPackages();
  }

  async getSubscriptionById(id: string) {
    return await this.subscriptionStore.getSubscriptionById(id);
  }

  async deleteSubscription(id: string) {
     return await this.subscriptionStore.deleteSubscription(id);
    }

  async updateSubscription(id: string, payload: UpdateSubscriptionDto) {
    return await this.subscriptionStore.updateSubscription(id, payload);
  }

}
