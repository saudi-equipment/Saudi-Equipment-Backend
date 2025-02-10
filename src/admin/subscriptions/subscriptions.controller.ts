import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dtos';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post()
  async createSubscription(@GetUser() user: User, @Body() payload: CreateSubscriptionDto) {
    return this.subscriptionService.createSubscription(user,payload);
  }

  @Get()
  async getAllSubscriptionsForPublic(
    @GetUser() user: User
  ) {
    return this.subscriptionService.getAllSubscriptionsForPublic(user);
  }

  @Get(':id')
  async getSubscriptionById(@Param('id') id: string) {
    return this.subscriptionService.getSubscriptionById(id);
  }
}
