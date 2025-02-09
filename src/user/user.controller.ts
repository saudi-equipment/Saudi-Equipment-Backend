import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request} from 'express';
import { UserService } from './user.service';
import { UserUpdateDto } from './dtos';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpireAdsMiddleware } from 'src/middleware/expire-ads-middleware';
import { Public } from 'src/decorators/public.routes.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly expireAdsMiddleware: ExpireAdsMiddleware,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @UseInterceptors(FileInterceptor('profilePicture'))
  @Put('update')
  async updateUser(
    @Req() req: Request,
    @Res() response,
    @GetUser('id') userId: string,
    @UploadedFile() profilePicture: Express.Multer.File,
    @Body() payload: UserUpdateDto,
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.userService.updateUser(userId, payload, profilePicture);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @Delete('delete-account')
  async deleteAccount(
    @Req() req: Request,
    @Res() response,
    @GetUser() user: User,
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      return await this.userService.deleteAccount(user);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @Get('profile')
  async getUserProfile(
    @Req() req: Request,
    @Res() response,
    @GetUser('id') userId: string,
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.userService.getUserById(userId);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @Patch('account/status')
  async activateOrDeactivateAccount(
    @Req() req: Request,
    @Res() response,
    @GetUser() user: User,
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.userService.activateOrDeactivateAccount(user);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }


  @Public()
  @Get(':id')
  async getUserWithAd(@Res() response, @Param('id') id: string) {
    try {
      const data = await this.userService.getUserWithAd(id);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
}
