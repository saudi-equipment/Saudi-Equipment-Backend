import { AdStore } from 'src/data-stores/ad/ad.store';
import { PaymentStore } from './../data-stores/payment/payment.data.store';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserStore } from 'src/data-stores/user/user.store';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from 'src/user/user.service';
import { CommonQueryDto } from 'src/common/dtos';
import { getPagination } from 'src/utils';

@Injectable()
export class PaymentService {
  private readonly moyasarSecretKey: string;
  constructor(
    private readonly paymentStore: PaymentStore,
    private readonly adStore: AdStore,
    private readonly userStore: UserStore,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.moyasarSecretKey =
      this.configService.get<string>('MOYASAR_SECRET_KEY');
  }

  private paymentSessions: { [key: string]: any } = {};

  createPaymentSession(payload: any) {
    const { amount } = payload;

    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const sessionId = uuidv4();
    this.paymentSessions[sessionId] = payload;
    return {
      sessionId,
    };
  }

  getPaymentDetails(sessionId: string) {
    const paymentData = this.paymentSessions[sessionId];

    if (!paymentData) {
      throw new NotFoundException('Invalid or expired session');
    }

    delete this.paymentSessions[sessionId];

    return paymentData;
  }

  async createSubscription(payload: any) {
    try {
      // const existingSubscription = await this.paymentStore.existingSubscription(payload.userId);

      // if(existingSubscription){
      //   throw new ConflictException("Already subscribed this plan")
      // }

      const subscription =
        await this.paymentStore.createOrUpdateSubscription(payload);
      const user = await this.userStore.makeUserPremium(subscription.user.id);
      return {
        subscription,
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  async promoteAd(payload: any) {
    try {
      const promotedAd = await this.paymentStore.promoteAd(payload);
      return promotedAd;
    } catch (error) {
      throw error;
    }
  }

  async getSubscription(userId: string) {
    return await this.paymentStore.getSubscription(userId);
  }

  async getAllPaymentDetails(query: CommonQueryDto) {
    try {
      const { page, limit } = query;
      const { skip, limit: currentLimit } = getPagination({ page, limit });
      const result = await this.paymentStore.getAllPaymentDetails(
        skip,
        currentLimit,
        query,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async expireUserSubscription(userId: string) {
    try {
      return await this.paymentStore.expireUserSubscription(userId);
    } catch (error) {
      throw error;
    }
  }
}
