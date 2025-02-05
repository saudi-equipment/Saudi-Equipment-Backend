import { AdStore } from 'src/data-stores/ad/ad.store';
import { PaymentStore } from './../data-stores/payment/payment.data.store';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    console.log(response);
    return response.data;
  }

  async createSubscription(payload: any) {
    try {
      const subscription = await this.paymentStore.createSubscription(payload);
      await this.userStore.makeUserPremium(subscription.user.id);
      return subscription;
    } catch (error) {
      throw error
    }
  }

  async promoteAd(payload: any){
    try {
      const promotedAd = await this.paymentStore.promoteAd(payload);
      return promotedAd;
    } catch (error) {
      throw error;
    }
  }
}
