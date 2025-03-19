import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { GetSubscriptionListQueryDto } from '../subscriptions/dtos';
import { CreateAdPackageDto, UpdateAdPackageDto } from './dtos';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packageServerice: PackagesService) {}

  @Get()
  async getPackageList(@Query() query: GetSubscriptionListQueryDto) {
    return this.packageServerice.getPackageList(query);
  }

  @Put(':id')
  async updatePackage(@Param('id') id: string, payload: UpdateAdPackageDto) {
    const packageData = await this.packageServerice.updatePackage(id, payload);
    if (!packageData) {
      throw new NotFoundException(`Package not found`);
    }
    return packageData;
  }

  @Roles(UserRole.ADMIN)
  @Post()
  async createPackage(
    @GetUser() user: User,
    @Body() payload: CreateAdPackageDto,
  ) {
    return this.packageServerice.createAdPackage(user, payload);
  }

  @Get(':id')
  async getPackageById(@Param('id') id: string) {
    const packageData = await this.packageServerice.getPackageById(id);
    if (!packageData) {
      throw new NotFoundException(`Package not found`);
    }
    return packageData;
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteSubscription(@Param('id') id: string) {
    const deletedPackage = await this.packageServerice.deletePackage(id);

    if (!deletedPackage) {
      throw new NotFoundException(`Package not found.`);
    }

    return {
      message: 'Package deleted successfully',
    };
  }
}
