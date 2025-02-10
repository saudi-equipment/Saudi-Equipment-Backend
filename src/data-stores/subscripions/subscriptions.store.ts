import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAdPackageDto, CreateSubscriptionDto } from 'src/admin/subscriptions/dtos';
import { UserRole } from 'src/enums';
import { AdPackage } from 'src/schemas/ad';
import { Subscription } from 'src/schemas/subscription/subscription.schema';
import { User } from 'src/schemas/user/user.schema';

@Injectable()
export class SubscriptionStore {
  constructor(
    @InjectModel('Subscription') private subscriptionModel: Model<Subscription>,
    @InjectModel('AdPackage') private adPackageModel: Model<AdPackage>,
  ) {}

  async createSubscription(
    user: User,
    payload: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = new this.subscriptionModel({
      ...payload,
      createdBy: new Types.ObjectId(user.id),
    });
    return subscription.save();
  }

  async createPackage(user: User, payload: CreateAdPackageDto){
    const adPackage = new this.adPackageModel({
      ...payload,
      createdBy: user.id
    });

    return adPackage.save();
  }

  async getAllPackages(){
    return await this.adPackageModel.find()
  }

  async getAllSubscriptions(user: User) {
    
    if (user.role === UserRole.ADMIN) return []; 
    return await this.subscriptionModel.aggregate([
      { $match: { transactionId: { $in: [null, ""] } } }, 
      {
        $project: {
          _id: 1,
          subscriptionName: 1,
          plan: 1,
          duration: 1,
          description: 1,
          createdBy: 1,
          subscriptionStatus: 1,
          price: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
  }
  
  async getPackageById(id: string){
    return await this.adPackageModel.findOne({
      _id: new Types.ObjectId(id)
    })
  }

  async getSubscriptionById(id: string) {
    return await this.subscriptionModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(id) },
      },
      {
        $project: {
          _id: 1,
          subscriptionName: 1,
          plan: 1,
          duration: 1,
          description: 1,
          subscriptionStatus: 1,
          price: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
  }
}
