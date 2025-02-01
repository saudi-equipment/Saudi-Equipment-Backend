import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {  UserUpdateDto } from './dtos';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/schemas/user/user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Put('update')
  async updateUser(
    @Res() response,
    @GetUser('id') userId: string,
    @Body() payload: UserUpdateDto,
  ) {
    try {
      const data = await this.userService.updateUser(userId, payload);
      return response.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Delete('delete-account')
  async deleteAccount(@GetUser() user: User) {
    try {
      return await this.userService.deleteAccount(user);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Get('profile')
  async getUserProfile(@Res() response, @GetUser('id') userId: string) {
    try {
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
