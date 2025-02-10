import { Injectable } from '@nestjs/common';
import { SubscriptionStore } from 'src/data-stores/subscripions/subscriptions.store';
import { CreateAdPackageDto, CreateSubscriptionDto } from './dtos';
import { User } from 'src/schemas/user/user.schema';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly subscriptionStore: SubscriptionStore) {}

  async createSubscription(user: User, payload: CreateSubscriptionDto) {
    return await this.subscriptionStore.createSubscription(user, payload);
  }

  async createAdPackage(user: User, payload: CreateAdPackageDto) {
    return await this.subscriptionStore.createPackage(user, payload);
  }

  async getAllSubscriptionsForPublic(user: User) {
    return await this.subscriptionStore.getAllSubscriptions(user);
  }

  async getAllPackages() {
    return await this.subscriptionStore.getAllPackages();
  }

  async getSubscriptionById(id: string){
    return await this.subscriptionStore.getSubscriptionById(id)
  }

  async getPackageById(id: string){
    return await this.subscriptionStore.getPackageById(id)
  }
}
