import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

interface oneSignalApiConfig {
  baseUrl: string;
  header: any;
  appId: string;
}

@Injectable()
export class OneSignalClient {
  private readonly config: oneSignalApiConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.config = {
      baseUrl: `https://onesignal.com`,
      header: {
        Authorization: `Basic ${this.configService.get<string>('ONESIGNAL_REST_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      appId: this.configService.get<string>('ONESIGNAL_APP_ID'),
    };
  }

  async post(endpoint: string, data?: any, options?: any): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.config.baseUrl}${endpoint}`, data, {
          headers: this.config.header,
          ...options,
        }),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }


  async createNotification(data: any): Promise<any> {
    try {
      const result = await this.post('/api/v1/notifications', data);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
