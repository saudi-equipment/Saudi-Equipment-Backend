import {
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { AddAdminUser, AddUser, GetUserListQueryDto, UserUpdateDto } from './dtos';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpireAdsMiddleware } from 'src/middleware/expire-ads-middleware';
import { Public } from 'src/decorators/public.routes.decorator';
import { validateProfilePicSize } from 'src/utils';
import { ConflictException } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly expireAdsMiddleware: ExpireAdsMiddleware,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('export-users')
  async getAllUsersToExportUsers(@Res() response) {
    try {
      const data = await this.userService.getAllUsersToExportUsers();
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
  
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @Get('user-payment-details')
  async getUserPaymentDetails(@GetUser() user: User) {
    try {
      return await this.userService.getUserPaymentDetails(user);
    } catch (error) {
      throw error;
    }
  }
  
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

      validateProfilePicSize(profilePicture);
      const data = await this.userService.updateUser(
        userId,
        payload,
        profilePicture,
      );
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
      const result = await this.userService.deleteAccount(user);
      return response.status(200).json(result);
    } catch (error) {
      return response.status(500).json({ message: error.message });
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

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('get-user-list')
  async getUserList(@Query() query: GetUserListQueryDto) {
    return await this.userService.getUserList(query);
  }

  @Public()
  @Get('user-list')
  async getAllUserList(@Query() query: GetUserListQueryDto) {
    return await this.userService.getAllUserList(query);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('add-user')
  async addUserByAdmin(@Body() payload: AddUser) {
    try {
      const existingEmail = await this.userService.findExistingUser(payload.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
      
      const existingPhone = await this.userService.findExistingUserByNumber(payload.phoneNumber);
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
      
      return await this.userService.addUserByAdmin(payload);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('add-admin')
  async addAdmin(@Body() payload: AddAdminUser) {
    try {
      const existingEmail = await this.userService.findExistingUser(payload.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
      
      const existingPhone = await this.userService.findExistingUserByNumber(payload.phoneNumber);
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
      
      return await this.userService.addAdmin(payload);
    } catch (error) {
      throw error;
    }
  }
  
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-list')
  async getAdminList(@Query() query: GetUserListQueryDto) {
    return await this.userService.getAdminList(query);
  }

  @Post('block/:userId')
  async toggleBlockUser(
    @Param('userId') userId: string,
    @Req() req: Request,
    @GetUser() currentUser: User,
  ) {
    const userIdForBlock = userId;
    const isBlocked = await this.userService.toggleBlockUser(
      currentUser,
      userIdForBlock,
    );

    return {
      message: isBlocked
        ? 'User blocked successfully'
        : 'User unblocked successfully',
      isBlocked,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updatUserByAdmin(
    @Body() payload: UserUpdateDto,
    @Param('id') id: string,
  ) {
    return await this.userService.updateUserByAdmin(payload, id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':userId/block')
  async blockUser(@Param('userId') userId: string) {
    const updatedUser = await this.userService.blockUser(userId);

    const message = updatedUser.isBlocked
      ? 'User has been blocked successfully'
      : 'User has been unblocked successfully';

    return {
      message,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deletUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return {
      statusCode: 200,
      message: 'User deleted successfully',
    };
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

  @Public()
  @Get('getUser/:id')
  async getUserById(@Res() response, @Param('id') id: string) {
    try {
      const data = await this.userService.getUserById(id);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
}
