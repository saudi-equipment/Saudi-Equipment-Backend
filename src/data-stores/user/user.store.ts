import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SignUpDto } from 'src/auth/dtos';
import { CommonQueryDto } from 'src/common/dtos';
import { UserRole } from 'src/enums';
import { ISubscription } from 'src/interfaces/payment/subscription.interface';
import { IPaymentTransaction } from 'src/interfaces/payment/payment.transaction.interface';
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
    @InjectModel('PaymentTransaction')
    private paymentTransactionModel: Model<IPaymentTransaction>,
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
        user: newUser._id,
        startDate: payload.startDate || new Date(),
        endDate: payload.endDate,
        plan: payload.plan,
        duration: payload.duration,
        price: payload.price,
        subscriptionStatus: 'active',
        subscribedBy: newUser._id,
        createdBy: newUser._id,
      });

      await newSubscription.save();
      newUser.subscriptions = newSubscription.id;
      await newUser.save();

      const newPaymentTransaction = new this.paymentTransactionModel({
        subscription: newSubscription.id,
        user: newUser._id,
        paymentType: payload.paymentType,
        paymentCompany: payload.paymentCompany,
        currency: 'SAR',
        price: payload.price,
        status: 'paid',
      });

      await newPaymentTransaction.save();
      newUser.paymentTransactions = newPaymentTransaction.id;
      await newUser.save();
    }

    return this.userModel
      .findById(newUser._id)
      .select('-password')
      .select('-__v')
      .populate('subscriptions')
      .populate('paymentTransactions');
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
      .select('-ads -adPromotions -blockedUsers')
      .select('-__v')
      .populate({
        path: 'subscriptions',
        select: '-__v',
        match: { subscriptionStatus: 'active' },
        options: { limit: 1 }
      })
      .populate({
        path: 'paymentTransactions',
        select: '-__v',
        match: { status: 'paid' },
        options: { limit: 1 }
      })
      .exec();

    // If user has active subscriptions, store the first one
    if (user && user.subscriptions && user.subscriptions.length > 0) {
      user.subscription = user.subscriptions[0];
    } 
    
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
      .populate('subscriptions')
      .populate('paymentTransactions');

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
        startDate: payload.startDate,
        endDate: payload.endDate,
        plan: payload.plan,
        duration: payload.duration,
        price: payload.price,
        subscriptionStatus: 'active',
      };

      const paymentTransactionData = {
        price: payload.price,
        paymentType: payload.paymentType,
        paymentCompany: payload.paymentCompany,
        currency: 'SAR',
        status: 'paid',
      };

      if (payload.subscriptionId) {
        await this.subscriptionModel.findByIdAndUpdate(
          payload.subscriptionId,
          { $set: subscriptionData },
          { new: true },
        );

      if(payload.subscriptionId){
        await this.paymentTransactionModel.findByIdAndUpdate(
          payload.subscriptionId,
          { $set: paymentTransactionData },
          { new: true },
        );
      }
      
      } else {
       
        const newSubscription = new this.subscriptionModel({
          user: userId,
          startDate: payload.startDate || new Date(),
          endDate: payload.endDate,
          plan: payload.plan,
          duration: payload.duration,
          price: payload.price,
          subscriptionStatus: 'active',
          subscribedBy: userId,
          createdBy: userId,
        });

        await newSubscription.save();
        updatedUser.subscriptions = newSubscription.id;
        await updatedUser.save();

        const newPaymentTransaction = new this.paymentTransactionModel({
          subscription: newSubscription.id,
          user: userId,
          paymentType: payload.paymentType,
          paymentCompany: payload.paymentCompany,
          currency: 'SAR',
          price: payload.price,
          status: 'paid',
        });

        await newPaymentTransaction.save();
        updatedUser.paymentTransactions = newPaymentTransaction.id;
        await updatedUser.save();
        
      }
    }

    return this.userModel
      .findById(updatedUser._id)
      .select('-password')
      .populate('subscriptions')
      .populate('paymentTransactions');
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

  async getUserPaymentDetails(user: User) {
    try {
      console.log(user.id);
      
      // Validate and convert user ID to ObjectId
      const userId = new Types.ObjectId(user.id);
      
      const userPaymentDetails = await this.userModel.aggregate([
        {
          $match: { _id: userId }
        },
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'user',
            as: 'subscriptions',
          },
        },
        {
          $lookup: {
            from: 'adpromotions',
            localField: '_id',
            foreignField: 'user',
            as: 'adPromotions'
          }
        },
        {
          $lookup: {
            from: 'paymenttransactions',
            localField: 'adPromotions._id',
            foreignField: 'adPromotion',
            as: 'adPromotionsPaymentTransactions'
          }
        },
        {
          $lookup: {
            from: 'paymenttransactions',
            localField: 'subscriptions._id',
            foreignField: 'subscription',
            as: 'subscriptionsPaymentTransactions'
          }
        },
        {
          $lookup: {
            from: 'ads',
            localField: 'adPromotions.ad',
            foreignField: '_id',
            as: 'ads'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            phoneNumber: 1,
            city: 1,
            isPremiumUser: 1,
            subscriptions: {
              $map: {
                input: '$subscriptions',
                as: 'sub',
                in: {
                  _id: '$$sub._id',
                  subscriptedBy: '$$sub.subscribedBy',
                  plan: '$$sub.plan',
                  status: '$$sub.subscriptionStatus',
                  startDate: '$$sub.startDate',
                  endDate: '$$sub.endDate',
                  payment: {
                    $let: {
                      vars: {
                        pt: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$subscriptionsPaymentTransactions',
                                as: 'pt',
                                cond: {
                                  $eq: ['$$pt.subscription', '$$sub._id']
                                }
                              }
                            },
                            0
                          ]
                        }
                      },
                      in: {
                        _id: '$$pt._id',
                        userId: '$$pt.userId',
                        subscriptionId: '$$pt.subscriptionId',
                        amount: '$$pt.price',
                        status: '$$pt.status',
                        method: '$$pt.paymentType',
                        company: '$$pt.paymentCompany',
                        currency: '$$pt.currency',
                        createdAt: '$$pt.createdAt',
                        updatedAt: '$$pt.updatedAt',
                      }
                    }
                  }
                }
              }
            },
            adPromotions: {
              $map: {
                input: '$adPromotions',
                as: 'ap',
                in: {
                  _id: '$$ap._id',
                  adId: '$$ap.adId',
                  adDetails: {
                    $let: {
                      vars: {
                        ad: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$ads',
                                as: 'ad',
                                cond: { 
                                  $eq: [
                                    { $toString: '$$ad._id' }, 
                                    { $toString: '$$ap.ad' }  // Changed from $$ap.adId to $$ap.ad
                                  ] 
                                }
                              }
                            },
                            0
                          ]
                        }
                      },
                      in: {
                        $cond: {
                          if: { $ne: ['$$ad', null] },
                          then: {
                            _id: '$$ad._id',
                            category: '$$ad.category',
                            fuelType: '$$ad.fuelType',
                            adId: '$$ad.adId',
                            titleAr: '$$ad.titleAr',
                            titleEn: '$$ad.titleEn',
                            
                            isActive: '$$ad.isActive',
                            isPromoted: '$$ad.isPromoted',
                            isSold: '$$ad.isSold',
                            views: '$$ad.views',
                            images: '$$ad.images',
                            createdAt: '$$ad.createdAt',
                            updatedAt: '$$ad.updatedAt'
                          },
                          else: null
                        }
                      }
                    }
                  },
                  promotedBy: '$$ap.promotedBy',
                  plan: '$$ap.promotionPlan',
                  startDate: '$$ap.promotionStartDate',
                  endDate: '$$ap.promotionEndDate',
                  payment: {
                    $let: {
                      vars: {
                        pt: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$adPromotionsPaymentTransactions',
                                as: 'pt',
                                cond: {
                                  $eq: ['$$pt.adPromotion', '$$ap._id']
                                }
                              }
                            },
                            0
                          ]
                        }
                      },
                      in: {
                        _id: '$$pt._id',
                        adpromotionId: '$$pt.adpromotionId',
                        userId: '$$pt.userId',
                        status: '$$pt.status',
                        amount: '$$pt.price',
                        method: '$$pt.paymentType',
                        company: '$$pt.paymentCompany',
                        currency: '$$pt.currency',
                        createdAt: '$$pt.createdAt',
                        updatedAt: '$$pt.updatedAt',
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]);
  
      if (!userPaymentDetails.length) {
        throw new NotFoundException('User not found');
      }
  
      return userPaymentDetails[0];
    } catch (error) {
      console.error('Error in getUserPaymentDetails:', error);
      throw error;
    }
  }

  async getUserList( query: GetUserListQueryDto,
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


    if (query.premiumUsers) {
      matchStage.isPremiumUser = query.premiumUsers;
    }
    
    if (query.city) {
      matchStage.city = query.city;
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
                subscriptions: 0,
                paymentTransactions: 0,
                adPromotions: 0,
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

  async getAllUserList(
    query: GetUserListQueryDto,
    skip: number,
    currentLimit: number,
  ): Promise<{
    users: IUser[];
    total: number;
    totalPages: number;
  }> {
    console.log("query--------------------",query);
    const { search, sortType, orderType } = query;

    const matchStage: any = {
      isDeleted: false,
      isActive: true,
      role: { $ne: UserRole.ADMIN } 
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
                isDeleted: 0,
                isBlocked: 0,
                subscription: 0,
                paymentTransactions: 0, 
                adPromotions: 0,        
                subscriptions: 0,       
                __v: 0,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          users: '$userList',
          total: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ];

    const result = await this.userModel.aggregate(aggregationPipeline).exec();
    const total = result[0]?.total || 0;
    const totalPages = Math.ceil(total / currentLimit);

    return {
      total,
      totalPages,
      users: result[0]?.users || [],
    };
  }

  async getUserWithAd(id: string): Promise<IUser | null> {
    const result = await this.userModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: 'ads',          let: { userAds: '$ads' },
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

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find(
      {
        isDeleted: false,
        role: { $ne: UserRole.ADMIN },
      },
    )
    .select('-blockedUsers')
    .select('-ads')
    .select('-__v')
    .select('-password')
    .select('-paymentTransactions')
    .select('-subscriptions')
    .select('-adPromotions')
    .exec();
  }

}
