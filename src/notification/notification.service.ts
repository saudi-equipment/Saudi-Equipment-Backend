import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private apiUrl: string;
  private apiKey: string;
  private sender: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('TAQNYAT_API_URL');
    this.apiKey = this.configService.get<string>('TAQNYAT_API_KEY');
    this.sender = this.configService.get<string>('SENDER');
  }

  async sendSms(phoneNumber: string, code: string) {
    try {
    
       await axios.post(
        this.apiUrl,
        {
          recipients: [phoneNumber],
          body: `Prolines Login OTP code is ${code}`,
          sender: this.sender,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

    } catch (error) {
      console.error(
        'Error sending SMS:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to send SMS notification.');
    }
  }
}
