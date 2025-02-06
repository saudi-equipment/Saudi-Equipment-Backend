import { AdStore } from 'src/data-stores/ad/ad.store';
import { PaymentStore } from './../data-stores/payment/payment.data.store';
import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserStore } from 'src/data-stores/user/user.store';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreatePaymentDto } from './dtos/create.payment.dto';
import { query } from 'express';
import { UserService } from 'src/user/user.service';

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

  async createPayment(payload: CreatePaymentDto) {
    console.log('KEY', this.moyasarSecretKey);
    const { amount, currency, description } = payload;
    const response = await axios.post(
      'https://api.moyasar.com/v1/payments',
      {
        amount: amount * 100,
        currency,
        description,
        source: {
          type: 'creditcard',
          name: 'Test User',
          number: '4111111111111111',
          month: '12',
          year: '2025',
          cvc: '123',
        },
        // callback_url: 'https://your-backend.com/moyasar/callback',
      },
      {
        auth: { username: this.moyasarSecretKey, password: '' },
      },
    );

    return response.data;
  }

  async createSubscription(payload: any) {
    try {
      const existingSubscription = await this.paymentStore.existingSubscription(payload.userId);

      if(existingSubscription){
        throw new ConflictException("Already subscribed this plan")
      }
      
      const subscription = await this.paymentStore.createSubscription(payload);
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

  async getSubscription(userId: string){
    return await this.paymentStore.getSubscription(userId)
  }


  async expireUserSubscription(userId: string) {
    try {
      return await this.paymentStore.expireUserSubscription(userId);
    } catch (error) {
      throw error;
    }
  }
}
