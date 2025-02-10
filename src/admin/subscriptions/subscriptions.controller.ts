import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateAdPackageDto, CreateSubscriptionDto } from './dtos';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}
  

  @Post()
  async createSubscription(@GetUser() user: User, @Body() payload: CreateSubscriptionDto) {
    return this.subscriptionService.createSubscription(user,payload);
  }

  @Post('create-package')
  async createPackage(@GetUser() user: User, @Body() payload: CreateAdPackageDto) {
    return this.subscriptionService.createAdPackage(user,payload);
  }

  @Get()
  async getAllSubscriptionsForPublic(
    @GetUser() user: User
  ) {
    return this.subscriptionService.getAllSubscriptionsForPublic(user);
  }

  @Get('packages')
  async getAllPackages() {
    try {
      return this.subscriptionService.getAllPackages();
    } catch (error) {
      throw error;
    }
  }

  @Get('package/:id')
  async getPackageById(@Param('id') id: string) {
    console.log("ID OF ", id)
    const packageData = await this.subscriptionService.getPackageById(id);
    if (!packageData) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
    return packageData;
  }


  @Get(':id')
  async getSubscriptionById(@Param('id') id: string) {
    return this.subscriptionService.getSubscriptionById(id);
  }

 
}
