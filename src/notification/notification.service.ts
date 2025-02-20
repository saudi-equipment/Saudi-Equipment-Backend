import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private smsApiUrl: string;
  private apiKey: string;
  private sender: string;
  private emailApiUrl: string;
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.smsApiUrl = this.configService.get<string>('TAQNYAT_SMS_API_URL');
    this.emailApiUrl = this.configService.get<string>('TAQNYAT_EMAIL_API_URL');
    this.apiKey = this.configService.get<string>('TAQNYAT_API_KEY');
    this.sender = this.configService.get<string>('SENDER');
  
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Use 465 for SSL or 587 for STARTTLS
      secure: false, // false for STARTTLS, true for SSL (465)
      auth: {
        user: this.configService.get<string>('SMTP_USER'), // Your Gmail email
        pass: this.configService.get<string>('SMTP_PASS'), // Your App Password
      },
      tls: {
        rejectUnauthorized: false, // Avoid SSL/TLS errors
      },
      debug: true,
      logger: true,
    });
    
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

  async sendMail(email: string, code: string) {
    try {
      console.log("EMAIL.............", email)
      console.log("Code.............", code)
      const info = await this.transporter.sendMail({
        from: "info@saudi-equipment.com",
        to: "athar123@yopmail.com",
        subject: 'Email Verification From the Saudi Equipment',
        html: `<p>Your verification code is: <strong>${code}</strong></p>`
      });
      console.log('Email sent:', info);
      return info;
    } catch (error) {
      console.error(
        'Error sending email:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to send email notification.');
    }
  }
}
