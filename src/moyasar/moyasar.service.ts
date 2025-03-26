import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MoyasarService {
  private readonly apiUrl = 'https://api.moyasar.com/v1';
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('MOYASAR_SECRET_KEY');
  }

  async createPayment(paymentData: {
    amount: number;
    currency: string;
    description: string;
    callback_url: string;
    source: any;
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payments`,
        paymentData,
        {
          auth: {
            username: this.secretKey,
            password: '',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Moyasar payment creation failed: ${error.message}`);
    }
  }

  async getPayment(paymentId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/payments/${paymentId}`, {
        auth: {
          username: this.secretKey,
          password: '',
        },
      });
      console.log('Response:', response);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  async listPayments(params?: any) {
    try {
      const response = await axios.get(`${this.apiUrl}/payments`, {
        auth: {
          username: this.secretKey,
          password: '',
        },
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list payments: ${error.message}`);
    }
  }
}
