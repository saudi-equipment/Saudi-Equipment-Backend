import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private smsApiUrl: string;
  private apiKey: string;
  private sender: string;
  private emailApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.smsApiUrl = this.configService.get<string>('TAQNYAT_SMS_API_URL');
    this.emailApiUrl = this.configService.get<string>('TAQNYAT_EMAIL_API_URL');
    this.apiKey = this.configService.get<string>('TAQNYAT_API_KEY');
    this.sender = this.configService.get<string>('SENDER');
  }

  async sendSms(phoneNumber: string, code: string) {
    try {
      await axios.post(
        this.smsApiUrl,
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

  // async sendMail(email: string): Promise<void> {
  //   try {
  //     await axios.post(
  //       this.emailApiUrl,
  //       {
  //         campaignName ='Prolines',
  //         subject = 'Verify Email',
  //         from = 'athar9157@gmail.com',
  //         to = 'MrCoder105@gmail.com',
  //         msg= <html><body><b>test</b></body></html>
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${this.apiKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     )
  //   } catch (error) {

  //   }
  // }

  async sendMail(email: string): Promise<void> {
    try {
      console.log("TOKEN", this.apiKey)
      const url = `${this.emailApiUrl}&bearerTokens=${this.apiKey}&campaignName=Prolines&subject=Verify Email&from=athar9157@gmail.com&to=${email}&msg=${encodeURIComponent('<html><body><b>test</b></body></html>')}`;


      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Email sent successfully:', response.data);
    } catch (error) {
      console.error(
        'Error sending email:',
        error.response?.data || error.message,
      );
    }
  }
}
