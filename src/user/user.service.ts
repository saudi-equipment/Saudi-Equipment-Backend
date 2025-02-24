import { query } from 'express';
import { Subscription } from './../schemas/subscription/subscription.schema';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from 'src/auth/dtos';
import { UserStore } from 'src/data-stores/user/user.store';
import { IUser } from 'src/interfaces/user/user.interface';
import { AddUser, GetUserListQueryDto, UserUpdateDto } from './dtos';
import { User } from 'src/schemas/user/user.schema';
import { DigitalOceanService } from 'src/digital.ocean/digital.ocean.service';
import { getPagination } from 'src/utils';

@Injectable()
export class UserService {
  constructor(
    private readonly userStore: UserStore,
    private readonly digitalOceanService: DigitalOceanService,
  ) {}

  async createUser(userData: SignUpDto): Promise<IUser> {
    const newUser = await this.userStore.createUser(userData);
    newUser.password = undefined;
    return newUser;
  }

  async findExistingUserByPhoneNumber(
    phoneNumber: string,
  ): Promise<IUser | null> {
    const user =
      await this.userStore.findExistingUserByPhoneNumber(phoneNumber);
    if (!user) {
      throw new NotFoundException('User is not exist');
    }
    return user;
  }

  async updatePassword(hashedPassword: string, phoneNumber: string) {
    return await this.userStore.updatedPassword(hashedPassword, phoneNumber);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    const existingEmail = await this.userStore.findExistingUser(email);

    if (!existingEmail) {
      throw new NotFoundException('Email is not exist');
    }

    return existingEmail;
  }

  async findAdminByEmail(email: string): Promise<IUser | null> {
    const existingEmail = await this.userStore.findAdminByEmail(email);

    if (!existingEmail) {
      throw new NotFoundException('User is not exist');
    }

    return existingEmail;
  }

  async findExistingUser(email: string): Promise<IUser | null> {
    const user = await this.userStore.findExistingUser(email);
    if (user) {
      throw new ConflictException('User is already exist');
    }
    return user;
  }

  async findUserById(id: string): Promise<IUser | null> {
    const user = await this.userStore.findById(id);
    if (!user) {
      throw new NotFoundException('User with ID not found');
    }
    return user;
  }

  async verifyUser(id: string) {
    this.findUserById(id);
    return await this.userStore.verifyUser(id);
  }

  async verifyEmail(email: string) {
    this.findUserByEmail(email);
    return await this.userStore.verifyEmail(email);
  }

  async updateUser(
    userId: string,
    payload: UserUpdateDto,
    profilePicture?: Express.Multer.File,
  ) {
    try {
      const existingUser = await this.userStore.findById(userId);

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (!existingUser.isVerified) {
        throw new ForbiddenException('User is not verified');
      }

      if (existingUser.isDeleted) {
        throw new ForbiddenException('User is deleted');
      }

      let newProfilePicUrl = existingUser.profilePicture || null;

      if (profilePicture) {
        if (existingUser.profilePicture) {
          await this.digitalOceanService.deleteFilesFromSpaces(
            existingUser.profilePicture,
          );
          await this.userStore.updateUser(userId, payload, newProfilePicUrl);
        }
        newProfilePicUrl =
          await this.digitalOceanService.uploadFileToSpaces(profilePicture);
      }

      if (!profilePicture && !payload.profilePicUrl) {
        if (existingUser.profilePicture) {
          await this.digitalOceanService.deleteFilesFromSpaces(
            existingUser.profilePicture,
          );
        }
        newProfilePicUrl = null;
      }

      if (!existingUser.profilePicture && newProfilePicUrl) {
        payload.profilePicUrl = newProfilePicUrl;
      }

      const updatedUser = await this.userStore.updateUser(
        userId,
        payload,
        newProfilePicUrl,
      );

      updatedUser.password = undefined;
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error.message);
      throw new BadRequestException('Failed to update user');
    }
  }

  async deleteAccount(user: User) {
    try {
      if (user.isDeleted === true) {
        return {
          message: 'User account deleted.',
        };
      }

      await this.userStore.deleteUser(user);
      return {
        message: 'Account deleted successfylly',
      };
    } catch (error) {
      throw error.message;
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    const user = await this.userStore.findById(userId);

    if (user.isVerified === false) {
      throw new ForbiddenException('User is not verified');
    }

    if (user.isDeleted === true) {
      throw new NotFoundException('User is not found');
    }

    user.password = undefined;
    return user;
  }

  async activateOrDeactivateAccount(user: User): Promise<IUser | null> {
    try {
      if (user.isVerified === false) {
        throw new ForbiddenException('User is not verified');
      }

      if (user.isDeleted === true) {
        throw new NotFoundException('User is not found');
      }

      const updatedUser =
        await this.userStore.activateOrDeactivateAccount(user);
      updatedUser.password = undefined;
      updatedUser.ads = undefined;
      updatedUser.subscriptions = undefined;
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async checkUserAccount(user: User) {
    if (user.isVerified === false) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        status: 'not_verified',
        message: 'User is not verified',
      };
    }

    if (user.isDeleted === true) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        status: 'deleted',
        message: 'User is not found',
      };
    }

    if (user.isActive === false) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        status: 'deactivated',
        message: 'Your account is deactivated. Please activate the account.',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      status: 'active',
      message: 'User account is active.',
    };
  }

  async getUserList(query: GetUserListQueryDto) {
    try {
      const { page, limit } = query;
      const { skip, limit: currentLimit } = getPagination({ page, limit });

      const users = await this.userStore.getUserList(query, skip, currentLimit);

      if (!users) {
        throw new NotFoundException('Users not found');
      }

      return users;
    } catch (error) {
      throw error;
    }
  }

  async addUserByAdmin(payload: AddUser) {
    try {
      return await this.userStore.addUserByAdmin(payload);
    } catch (error) {
      throw error;
    }
  }

  async getUserWithAd(id: string): Promise<IUser | null> {
    try {
      return await this.userStore.getUserWithAd(id);
    } catch (error) {
      throw error;
    }
  }

  async expireUserSubscription(userId: string) {
    try {
      return await this.userStore.expireUserSubscription(userId);
    } catch (error) {
      throw error;
    }
  }
}
