import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SignUpDto } from 'src/auth/dtos';
import { CommonQueryDto } from 'src/common/dtos';
import { UserRole } from 'src/enums';
import { ISubscription } from 'src/interfaces/payment/subscription.interface';
import { IUser } from 'src/interfaces/user';
import { User } from 'src/schemas/user/user.schema';
import {
  AddAdminUser,
  AddUser,
  GetUserListQueryDto,
  UserUpdateDto,
} from 'src/user/dtos';
import { generateTransactionId } from 'src/utils/generate.transaction.id.helper';

@Injectable()
export class UserStore {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Subscription')
    private subscriptionModel: Model<ISubscription>,
  ) {}

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

  async addUserByAdmin(payload: AddUser): Promise<IUser> {
    const newUser = new this.userModel({
      isEmailVerified: payload.emailStatus,
      isActive: payload.phoneNumberStatus,
      isVerified: true,
      isPremiumUser: payload.isPremiumUser,
      ...payload,
    });

    await newUser.save();

    if (payload.isPremiumUser) {
      const newSubscription = new this.subscriptionModel({
        transactionId: generateTransactionId(),
        user: newUser._id,
        subscriptionStatus: 'active',
        startDate: payload.startDate || new Date(),
        endDate: payload.endDate,
        subscribedBy: newUser._id,
        createdBy: newUser._id,
        plan: payload.plan,
        duration: payload.duration,
        price: payload.price,
        paymentType: payload.paymentType,
        paymentCompany: payload.paymentCompany,
      });

      await newSubscription.save();

      newUser.subscription = newSubscription.id;
      await newUser.save();
    }

    return this.userModel
      .findById(newUser._id)
      .select('-password')
      .select('-__v')
      .populate('subscription');
  }

  async addAdmin(payload: AddAdminUser) {
    const newUser = new this.userModel({
      isEmailVerified: true,
      isActive: true,
      role: UserRole.ADMIN,
      isPremiumUser: true,
      isVerified: true,
      ...payload,
    });
    await newUser.save();
    return this.userModel
      .findById(newUser._id)
      .select('-password')
      .select('-blockedUsers')
      .select('-ads')
      .select('-__v');
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
    const user = await this.userModel
      .findById(id)
      .select('-ads')
      .select('-__v')
      .populate({
        path: 'subscription',
        select: '-__v',
      })
      .exec();

    return user;
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
    newProfilePicUrl?: string,
  ): Promise<IUser | null> {
    const existingUser = await this.userModel
      .findById(userId)
      .populate('subscription');
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            ...payload,
            profilePicture: newProfilePicUrl,
            isEmailVerified: payload.emailStatus,
            isActive: payload.phoneNumberStatus,
            isPremiumUser: payload.isPremiumUser,
          },
        },
        { new: true },
      )
      .select('-password');

    if (payload.isPremiumUser) {
      const subscriptionData = {
        ...(payload.startDate && { startDate: payload.startDate }),
        ...(payload.endDate && { endDate: payload.endDate }),
        ...(payload.plan && { plan: payload.plan }),
        ...(payload.duration && { duration: payload.duration }),
        ...(payload.price && { price: payload.price }),
        ...(payload.paymentType && { paymentType: payload.paymentType }),
        ...(payload.paymentCompany && {
          paymentCompany: payload.paymentCompany,
        }),
        subscriptionStatus: 'active',
      };

      if (existingUser.subscription) {
        await this.subscriptionModel.findByIdAndUpdate(
          existingUser.subscription._id,
          { $set: subscriptionData },
          { new: true },
        );
      } else {
        const newSubscription = new this.subscriptionModel({
          transactionId: generateTransactionId(),
          user: userId,
          startDate: payload.startDate || new Date(),
          endDate: payload.endDate,
          plan: payload.plan,
          duration: payload.duration,
          price: payload.price,
          paymentType: payload.paymentType,
          paymentCompany: payload.paymentCompany,
          subscriptionStatus: 'active',
          subscribedBy: userId,
          createdBy: userId,
        });

        await newSubscription.save();
        updatedUser.subscription = newSubscription.id;
        await updatedUser.save();
      }
    }

    return this.userModel
      .findById(updatedUser._id)
      .select('-password')
      .populate('subscription');
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

  async blockUser(userId: string): Promise<IUser | null> {
    try {
      const user = await this.userModel.findById(userId).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(userId) },
          { $set: { isBlocked: !user.isBlocked, isActive: !user.isActive } },
          { new: true },
        )
        .select('-password');

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deleteUserByAdmin(userId: string): Promise<void> {
    return await this.userModel.findByIdAndDelete({
      _id: new Types.ObjectId(userId),
    });
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
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
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
                blockedUsers: 0,
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

  async toggleBlockUser(
    currentUser: User,
    userIdForBlock: string,
  ): Promise<boolean> {
    const objeUserId = new Types.ObjectId(userIdForBlock);
    const isAlreadyBlocked = currentUser.blockedUsers.includes(objeUserId);

    if (isAlreadyBlocked) {
      await this.userModel.findByIdAndUpdate(
        currentUser._id,
        { $pull: { blockedUsers: userIdForBlock } },
        { new: true },
      );
      return false;
    } else {
      await this.userModel.findByIdAndUpdate(
        currentUser._id,
        { $addToSet: { blockedUsers: userIdForBlock } },
        { new: true },
      );
      return true;
    }
  }

  async getAdminList(
    query: CommonQueryDto,
    skip: number,
    currentLimit: number,
  ): Promise<{
    admins: User[];
    totalAdmins: number;
  }> {
    const { search, sortType, orderType } = query;

    const matchStage: any = {
      role: UserRole.ADMIN,
      isDeleted: false,
    };

    if (search) {
      matchStage.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const sortStage: Record<string, any> = {};

    if (sortType === 'Newest') {
      sortStage.createdAt = -1;
    } else if (sortType === 'Oldest') {
      sortStage.createdAt = 1;
    }

    if (orderType === 'A-Z') {
      sortStage.email = 1;
    } else if (orderType === 'Z-A') {
      sortStage.email = -1;
    }

    const aggregationPipeline = [
      { $match: matchStage },
      { $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 } },
      {
        $facet: {
          adminList: [
            { $skip: skip },
            { $limit: currentLimit },
            {
              $project: {
                name: 1,
                phoneNumber: 1,
                email: 1,
                city: 1,
                profilePicture: 1,
                role: 1,
                isVerified: 1,
                isActive: 1,
                isEmailVerified: 1,
                isBlocked: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          admins: '$adminList',
          totalAdmins: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ];

    const result = await this.userModel.aggregate(aggregationPipeline).exec();

    return {
      totalAdmins: result[0]?.totalAdmins || 0,
      admins: result[0]?.admins || [],
    };
  }
}
