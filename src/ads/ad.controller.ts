import { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateAdDto,
  GetAllAdQueryDto,
  ReportAdDto,
  UpdateAdDto,
} from './dtos';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';
import { AdService } from './ad.service';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { UserRole } from 'src/enums';
import { Roles } from 'src/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ExpireAdsMiddleware } from 'src/middleware/expire-ads-middleware';
import { Public } from 'src/decorators/public.routes.decorator';

@Controller('ad')
export class AdController {
  constructor(
    private readonly adService: AdService,
    private readonly expireAdsMiddleware: ExpireAdsMiddleware,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @Post('report-ad/:adId')
  async reportAd(
    @Req() req: Request,
    @Res() response,
    @GetUser('id') userId: string,
    @Body() payload: ReportAdDto,
    @Param('adId') adId: string,
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.adService.reportAd(adId, userId, payload);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('create-ad')
  @UseInterceptors(FilesInterceptor('files', 10))
  async createAds(
    @Req() req: Request,
    @Res() response,
    @GetUser() user: User,
    @Body() payload: CreateAdDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      if (files && files.length === 0) {
        throw new BadRequestException('Select alteast one file');
      }
      const data = await this.adService.createAd(user, payload, files);
      return response
        .status(HttpStatus.CREATED)
        .json({ message: 'Ad created successfully', data });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'An error occurred while creating the ad',
      });
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @Get('my-ads')
  async getMyAds(@Req() req: Request, @Res() response, @GetUser() user: User) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.adService.getMyAds(user);
      return response
        .status(HttpStatus.OK)
        .json({ message: 'Ads retrived successfully', data });
    } catch (error) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message || 'Ad Not found',
      });
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 10))
  async updateAd(
    @Req() req: Request,
    @Res() response,
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() payload: UpdateAdDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.adService.updateAd(id, user, payload, files);

      if (!data) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Ad not found or update failed', data: null });
      }

      return response
        .status(HttpStatus.OK)
        .json({ message: 'Ad updated successfully', data });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'An error occurred while updating the ad',
      });
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllAdsForAdmin(@Res() response, @Query() query: GetAllAdQueryDto) {
    try {
      const data = await this.adService.getAllAdsForAdmin(query);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message || 'Ads Not found',
      });
    }
  }

  @Public()
  @Get('get-all-ad')
  async getAllAds(@Res() response, @Query() query: GetAllAdQueryDto) {
    try {
      const data = await this.adService.getAllAd(query);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message || 'Ad Not found',
      });
    }
  }

  @Public()
  @Get(':id')
  async getAdById(@Res() response, @Param('id') id: string) {
    try {
      const data = await this.adService.getAdById(id);
      const result = { ad: data };

      return response.status(HttpStatus.OK).json(result);
    } catch (error) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message || 'Ad Not found',
      });
    }
  }

  @Patch(':id/repost')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  async repostAd(
    @Req() req: Request,
    @GetUser() user: User,
    @Res() response,
    @Param('id') id: string,
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.adService.repostAd(user, id);
      return response.status(HttpStatus.OK).json({ ad: data });
    } catch (error) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message || 'Ad Not found',
      });
    }
  }

  @Patch(':id/sell')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  async updateAdSellStatus(
    @Req() req: Request,
    @GetUser() user: User,
    @Res() response,
    @Param('id') id: string,
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.adService.updateAdSellStatus(user, id);
      return response.status(HttpStatus.OK).json({ ad: data });
    } catch (error) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message || 'Ad Not found',
      });
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Delete(':id')
  async deleteAd(@Res() response, @Param('id') id: string) {
    try {
      const result = await this.adService.deleteAd(id);
      if (result) {
        return response.status(200).json({
          message: 'Ad successfully deleted',
        });
      } else {
        return response.status(404).json({
          message: 'Ad not found',
        });
      }
    } catch (error) {
      return response.status(500).json({
        message: 'Error deleting ad',
        error: error.message,
      });
    }
  }
}
