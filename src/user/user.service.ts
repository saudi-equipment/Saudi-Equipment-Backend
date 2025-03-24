import {
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
import { getPagination, hashPassword, validatePassword } from 'src/utils';
import { AdStore } from 'src/data-stores/ad/ad.store';

@Injectable()
export class UserService {
  constructor(
    private readonly userStore: UserStore,
    private readonly adStore: AdStore,
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

    if (!user || user.isDeleted) {
      throw new NotFoundException('User is not found');
    }

    return user;
  }

  async toggleBlockUser(
    currentUser: User,
    userIdForBlock: string,
  ): Promise<boolean> {
    return await this.userStore.toggleBlockUser(currentUser, userIdForBlock);
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
      if (!existingUser) throw new NotFoundException('User not found');

      let newProfilePicUrl = existingUser.profilePicture || null;

      if (profilePicture) {
        if (existingUser.profilePicture) {
          await this.digitalOceanService.deleteFilesFromSpaces(
            existingUser.profilePicture,
          );
        }

        newProfilePicUrl =
          await this.digitalOceanService.uploadFileToSpaces(profilePicture);
      }

      if (
        !profilePicture &&
        !payload.profilePicUrl &&
        existingUser.profilePicture
      ) {
        await this.digitalOceanService.deleteFilesFromSpaces(
          existingUser.profilePicture,
        );
        newProfilePicUrl = null;
      }

      if (newProfilePicUrl) payload.profilePicUrl = newProfilePicUrl;

      const updatedUser = await this.userStore.updateUser(
        userId,
        payload,
        newProfilePicUrl,
      );
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount(user: User) {
    try {
      await this.userStore.deleteUser(user);
      await this.adStore.deleteUserAds(user);
      return {
        message: 'Account deleted successfylly',
      };
    } catch (error) {
      throw error.message;
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    const user = await this.userStore.findById(userId);
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
      updatedUser.subscription = undefined;
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async checkUserAccount(user: User) {
    if (user.isVerified === false) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User is not verified',
      };
    }

    if (user.isDeleted === true) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User is not found',
      };
    }

    if (user.isBlocked === true) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message:
          'Your account is blocked. Please contact saudi-equipment support team to activate your account',
      };
    }

    if (user.isActive === false) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Your account is deactivated. Please activate the account.',
      };
    }

    return {
      statusCode: HttpStatus.OK,
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
      this.findExistingUser(payload.email);
      this.findExistingUserByPhoneNumber(payload.phoneNumber);

      validatePassword(payload.password, payload.confirmPassword);

      const hashedPassword = await hashPassword(payload.password);
      const userData = { ...payload, password: hashedPassword };
      return await this.userStore.addUserByAdmin(userData);
    } catch (error) {
      throw error;
    }
  }

  async updateUserByAdmin(
    payload: UserUpdateDto,
    id: string,
  ): Promise<IUser | null> {
    return await this.userStore.updateUser(id, payload);
  }

  async blockUser(userId: string): Promise<IUser | null> {
    return await this.userStore.blockUser(userId);
  }

  async deleteUser(id: string): Promise<void> {
    return await this.userStore.deleteUserByAdmin(id);
  }

  async checkUserBlockStatusByPhoneNumber(
    phoneNumber?: string,
  ): Promise<IUser | null> {
    const user =
      await this.userStore.findExistingUserByPhoneNumber(phoneNumber);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isBlocked == true) {
      throw new ForbiddenException(
        'Your account is blocked. Please contact saudi-equipment support team to activate your account',
      );
    }
    return user;
  }

  async checkUserBlockStatusByEmail(email: string): Promise<IUser | null> {
    const user = await this.userStore.findExistingUser(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBlocked == true) {
      throw new ForbiddenException(
        'Your account is blocked. Please contact saudi-equipment support team to activate your account',
      );
    }
    return user;
  }

  async checkUserBlockStatusByUserId(userId: string): Promise<IUser | null> {
    const user = await this.userStore.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBlocked == true) {
      throw new ForbiddenException(
        'Your account is blocked. Please contact saudi-equipment support team to activate your account',
      );
    }
    return user;
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
