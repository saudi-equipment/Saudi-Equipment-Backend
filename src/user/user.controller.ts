import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request} from 'express';
import { UserService } from './user.service';
import { UserUpdateDto } from './dtos';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';
import { ExpireAdsMiddleware } from 'src/middleware/expire-ads-middleware';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly expireAdsMiddleware: ExpireAdsMiddleware,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Put('update')
  async updateUser(
    @Req() req: Request,
    @Res() response,
    @GetUser('id') userId: string,
    @Body() payload: UserUpdateDto,
  ) {
    try {
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.userService.updateUser(userId, payload);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Get('profile')
  async getUserProfile(
    @Req() req: Request,
    @Res() response,
    @GetUser('id') userId: string,
  ) {
    try {
      console.log("User controller")
      await this.expireAdsMiddleware.use(req, response, () => {});
      const data = await this.userService.getUserById(userId);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

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
