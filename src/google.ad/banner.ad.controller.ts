import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { GetUser } from 'src/decorators/user.decorator';
import { BannerAdService } from './banner.ad.service';
import { CreateBannerAdDto, UpdateBannerAdDto } from './dtos';
import { User } from 'src/schemas/user/user.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommonQueryDto } from 'src/common/dtos';

@Controller('bannerad')
export class BannerAdController {
  constructor(private readonly bannerAdService: BannerAdService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('create')
  @UseInterceptors(FilesInterceptor('files', 10))
  async createBannerAd(
    @GetUser() user: User,
    @Body() payload: CreateBannerAdDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      if (files && files.length === 0) {
        throw new BadRequestException('Select at least one file');
      }

      const data = await this.bannerAdService.createBannerAd(
        user,
        payload,
        files,
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 10))
  async updateBannerAd(
    @Param('id') id: string,
    @Body() payload: UpdateBannerAdDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const data = await this.bannerAdService.updateBannerAd(
        id,
        payload,
        files,
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Delete(':id')
  async deleteBannerAd(@Res() response, @Param('id') id: string) {
    try {
      const result = await this.bannerAdService.deleteBannerAd(id);
      if (result) {
        return response.status(200).json({
          message: 'Banner Ad successfully deleted',
        });
      } else {
        return response.status(404).json({
          message: 'Banner Ad not found',
        });
      }
    } catch (error) {
      return response.status(500).json({
        message: 'Error deleting ad',
        error: error.message,
      });
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('list')
  async getAllBannerAds(@Query() query: CommonQueryDto) {
    return await this.bannerAdService.getAllBannerAds(query);
  }
}
