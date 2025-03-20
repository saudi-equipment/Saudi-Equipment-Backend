import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SignUpDto } from 'src/auth/dtos';
import { UserRole } from 'src/enums';
import { IUser } from 'src/interfaces/user';
import { User } from 'src/schemas/user/user.schema';
import { AddUser, GetUserListQueryDto, UserUpdateDto } from 'src/user/dtos';

@Injectable()
export class UserStore {
  constructor(@InjectModel('User') private userModel: Model<IUser>) {}

  async findExistingUser(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAdminByEmail(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email, role: UserRole.ADMIN }).exec();
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

  async addUserByAdmin(payload: AddUser) {
    const newUser = new this.userModel({
      isEmailVerified: payload.emailStatus,
      isActive: payload.phoneNumberStatus,
      isVerified: true,
      ...payload,
    });
    await newUser.save();
    return this.userModel.findById(newUser._id).select('-password');
  }

  // async updateUserByAdmin(payload: UserUpdateDto, id: string):Promise<IUser | null>{
  //  const updatedUser = await this.userModel.findOneAndUpdate(
  //    {_id: new Types.ObjectId(id)},
  //    {$set: {...payload}},
  //    {new: true}
  //  )
  //  .select('-password');
  //  return updatedUser
  // }

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
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { _id: user.id },
        { $set: { isActive: !user.isActive } },
        { new: true },
      )
      .select('-password');
    return updatedUser;
  }

  async verifyUser(id: string) {
    try {
      return await this.userModel.updateOne({ _id: id }, { isVerified: true });
    } catch (error) {
      throw error.message;
    }
  }

  async verifyEmail(email: string) {
    try {
      return await this.userModel.updateOne(
        { email: email },
        { isEmailVerified: true },
      );
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
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: userId },
          { $set: { ...payload, profilePicture: updatedProfilePic } },
          { new: true },
        )
        .select('-password');
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deleteUserByAdmin(userId: string): Promise<void> {
    return await this.userModel.findByIdAndDelete({ _id: new Types.ObjectId(userId) });
  }

  async expireUserSubscription(userId: string) {
    try {
      const now = new Date();

      const result = await this.userModel.updateMany({
        _id: new Types.ObjectId(userId),
      });
    } catch (error) {}
  }

  async getUserList(
    query: GetUserListQueryDto,
    skip: number,
    currentLimit: number,
  ): Promise<{
    users: IUser[];
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    premiumUsers: number;
  }> {
    const { search, sortType, orderType } = query;

    const matchStage: any = {
      isDeleted: false,
      role: { $ne: UserRole.ADMIN },
    };

    if (search) {
      matchStage.name = { $regex: search, $options: 'i' };
    }

    const sortStage: Record<string, any> = {};

    if (sortType === 'Newest') {
      sortStage.createdAt = -1;
    } else if (sortType === 'Oldest') {
      sortStage.createdAt = 1;
    }

    if (orderType === 'A-Z') {
      sortStage.name = 1;
    } else if (orderType === 'Z-A') {
      sortStage.name = -1;
    }

    const aggregationPipeline = [
      { $match: matchStage },
      { $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 } },
      {
        $facet: {
          userList: [
            { $skip: skip },
            { $limit: currentLimit },
            {
              $project: {
                password: 0,
                ads: 0,
                subscriptions: 0,
              },
            },
          ],
          totalUsers: [{ $count: 'count' }],
          activeUsers: [{ $match: { isActive: true } }, { $count: 'count' }],
          inactiveUsers: [{ $match: { isActive: false } }, { $count: 'count' }],
          premiumUsers: [
            { $match: { isPremiumUser: true } },
            { $count: 'count' },
          ],
        },
      },
      {
        $project: {
          users: '$userList',
          totalUsers: { $arrayElemAt: ['$totalUsers.count', 0] },
          activeUsers: { $arrayElemAt: ['$activeUsers.count', 0] },
          inactiveUsers: { $arrayElemAt: ['$inactiveUsers.count', 0] },
          premiumUsers: { $arrayElemAt: ['$premiumUsers.count', 0] },
        },
      },
    ];

    const result = await this.userModel.aggregate(aggregationPipeline).exec();

    return {
      totalUsers: result[0].totalUsers || 0,
      activeUsers: result[0].activeUsers || 0,
      inactiveUsers: result[0].inactiveUsers || 0,
      premiumUsers: result[0].premiumUsers || 0,
      users: result[0].users,
    };
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
            {
              $sort: { createdAt: -1 },
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
        {
          $set: {
            ads: [],
            subscriptions: [],
            email: `${date}${user.email}`,
            phoneNumber: `${date}${user.phoneNumber}`,
            isDeleted: true,
          },
        },
      );
    } catch (error) {
      throw new error();
    }
  }
}
