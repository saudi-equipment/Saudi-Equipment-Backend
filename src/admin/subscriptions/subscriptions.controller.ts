import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionDto,
  GetSubscriptionListQueryDto,
  UpdateSubscriptionDto,
} from './dtos';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async createSubscription(
    @GetUser() user: User,
    @Body() payload: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createSubscription(user, payload);
  }

  @Get('list')
  async getAllSubscriptionsList(@Query() query: GetSubscriptionListQueryDto) {
    return this.subscriptionService.getAllSubscriptionsList(query);
  }

  @Get('used-list')
  async usedSubscriptionsList(@Query() query: GetSubscriptionListQueryDto) {
    return this.subscriptionService.usedSubscriptionsList(query);
  }

  @Get()
  async getAllSubscriptionsForPublic(@GetUser() user: User) {
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

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteSubscription(@Param('id') id: string) {
    const deletedSubscription =
      await this.subscriptionService.deleteSubscription(id);

    if (!deletedSubscription) {
      throw new NotFoundException(`Subscription not found.`);
    }

    return {
      message: 'Subscription deleted successfully',
    };
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updateSubscription(
    @Param('id') id: string,
    @Body() payload: UpdateSubscriptionDto,
  ) {
    const subscription = await this.subscriptionService.updateSubscription(
      id,
      payload,
    );

    if (!subscription) {
      throw new NotFoundException(`Subscription not found.`);
    }

    return subscription;
  }

  @Get(':id')
  async getSubscriptionById(@Param('id') id: string) {
    const subscription = await this.subscriptionService.getSubscriptionById(id);

    if (!subscription) {
      throw new NotFoundException(`Subscription not found.`);
    }

    return subscription;
  }
}
