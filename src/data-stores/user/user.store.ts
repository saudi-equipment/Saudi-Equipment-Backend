import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SignUpDto } from 'src/auth/dtos';
import { IUser } from 'src/interfaces/user';
import { User } from 'src/schemas/user/user.schema';
import { UserUpdateDto } from 'src/user/dtos';

@Injectable()
export class UserStore {
  constructor(@InjectModel('User') private userModel: Model<IUser>) {}

  async findExistingUser(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findExistingUserByPhoneNumber(
    phoneNumber: string,
  ): Promise<IUser | null> {
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  async createUser(userData: SignUpDto): Promise<IUser> {
    const newUser = new this.userModel(userData);
    return await newUser.save();
  }

  async makeUserPremium(userId: string) {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        new Types.ObjectId(userId),
        { isPremiumUser: true },
        { new: true, select: 'id, name, isPremiumUser' },
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error making user premium:', error);
      throw error;
    }
  }

  async updatedPassword(
    hashedPassword: string,
    phoneNumber: string,
  ): Promise<IUser> {
    return await this.userModel.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { password: hashedPassword },
      { new: true },
    );
  }

  async findById(id: string): Promise<IUser | null> {
    return await this.userModel.findById({ _id: id }).exec();
  }

  async activateOrDeactivateAccount(user: User): Promise<IUser | null> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: user.id },
      { $set: { isActive: !user.isActive } },
      {new: true}
    )

    return updatedUser;
  }

  async verifyUser(id: string) {
    try {
      return await this.userModel.updateOne({ _id: id }, { isVerified: true });
    } catch (error) {
      throw error.message;
    }
  }

  async updateUser(
    userId: string,
    payload: UserUpdateDto,
    updatedProfilePic?: string,
  ): Promise<IUser | null> {
    try {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: userId },
        { $set: { ...payload, profilePicture: updatedProfilePic } },
        { new: true },
      );
      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user error: ${error.message}`);
    }
  }

  async expireUserSubscription(userId: string) {
    try {
      const now = new Date();

      const result = await this.userModel.updateMany({
        _id: new Types.ObjectId(userId),
      });
    } catch (error) {}
  }

  async getUserWithAd(id: string): Promise<IUser | null> {
    const result = await this.userModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: 'ads',
          let: { userAds: '$ads' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$_id', '$$userAds'] },
                    { $eq: ['$isActive', true] },
                  ],
                },
              },
            },
          ],
          as: 'ads',
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    return result.length ? (result[0] as IUser) : null;
  }

  async deleteUser(user: User) {
    try {
      const date = new Date().toDateString();
      return await this.userModel.updateOne(
        {
          _id: user.id,
        },
        { email: `${date}${user.email}`, isDeleted: true },
      );
    } catch (error) {
      throw new error();
    }
  }
}
