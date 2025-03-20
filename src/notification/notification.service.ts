import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { ContactUsDto } from 'src/newsletter/dtos/contact.us.dto';

@Injectable()
export class NotificationService {
  private smsApiUrl: string;
  private apiKey: string;
  private sender: string;
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.smsApiUrl = this.configService.get<string>('TAQNYAT_SMS_API_URL');
    this.apiKey = this.configService.get<string>('TAQNYAT_API_KEY');
    this.sender = this.configService.get<string>('SENDER');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<string>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
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
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to: email,
        subject: 'Email Verification From the Saudi Equipment',
        html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            Thank you for verifying email! Please use the following verification code to verify your email.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #007bff; background: #eef2ff; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              ${code}
            </span>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">
            If you did not request this email, please ignore it.
          </p>
        </div>
      `,
      });
      return info;
    } catch (error) {
      throw error;
    }
  }

  async sendContactEmail(contactData: ContactUsDto) {
    try {
      // console.log(
      //   'Received contact data:',
      //   JSON.stringify(contactData, null, 2),
      // );
      const info = await this.transporter.sendMail({
        from: contactData.email,
        to: this.configService.get<string>('SMTP_USER'),
        subject: contactData.subject,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">New Contact Inquiry</h2>
            <p style="font-size: 16px; color: #555;">
              <strong>Full Name:</strong> ${contactData.fullName}<br>
              <strong>Phone Number:</strong> ${contactData.phoneNumber}<br>
              <strong>Email:</strong> ${contactData.email}<br>
              <strong>City:</strong> ${contactData.city}<br>
              <strong>Inquiry Type:</strong> ${contactData.inquiryType}<br>
              <strong>Subject:</strong> ${contactData.subject}<br>
              <strong>Message:</strong> ${contactData.message}<br>
            </p>
            <p style="font-size: 14px; color: #777; text-align: center;">
              This inquiry was submitted through the contact form.
            </p>
          </div>
        `,
      });

      // Log the email sending result
      // console.log('Email sent successfully:', JSON.stringify(info, null, 2));
      return info;
    } catch (error) {
      throw error;
    }
  }
}
