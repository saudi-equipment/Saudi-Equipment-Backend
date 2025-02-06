import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from 'src/auth/dtos';
import { UserStore } from 'src/data-stores/user/user.store';
import { IUser } from 'src/interfaces/user/user.interface';
import { UserUpdateDto } from './dtos';
import { User } from 'src/schemas/user/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userStore: UserStore) {}

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

  async updateUser(userId: string, payload: UserUpdateDto) {
    try {
      const existingUser = await this.userStore.findById(userId);

      if (existingUser.isVerified === false) {
        throw new ForbiddenException('User is not verified');
      }

      if (existingUser.isDeleted === true) {
        throw new ForbiddenException('User is deleted');
      }

      if (existingUser.isVerified === true) {
        const updatedUser = await this.userStore.updateUser(userId, payload);
        updatedUser.password = undefined;
        return updatedUser;
      }
    } catch (error) {
      throw error;
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

  async getUserWithAd(id: string): Promise<IUser | null> {
    try {
      return await this.userStore.getUserWithAd(id);
    } catch (error) {
      throw error;
    }
  }

  async expireUserSubscription(userId: string){
    try {
      return await this.userStore.expireUserSubscription(userId)
    } catch (error) {
      throw error;
    }
  }
}
