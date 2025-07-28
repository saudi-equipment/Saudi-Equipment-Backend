import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { ContactUsDto } from 'src/newsletter/dtos/contact.us.dto';
import { OneSignalService } from 'onesignal-api-client-nest';
import { User } from 'src/schemas/user/user.schema';
import * as sgMail from '@sendgrid/mail';
@Injectable()
export class NotificationService {
  private smsApiUrl: string;
  private apiKey: string;
  private sender: string;
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly oneSignalService: OneSignalService,
  ) {
    this.smsApiUrl = this.configService.get<string>('TAQNYAT_SMS_API_URL');
    this.apiKey = this.configService.get<string>('TAQNYAT_API_KEY');
    this.sender = this.configService.get<string>('SENDER');

    this.transporter = nodemailer.createTransport(
      sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY')),
    );
  }

  async sendSms(phoneNumber: string, code: string) {
    try {
      this.logger.log(`Sending SMS to ${phoneNumber} with code ${code}`);
      await axios.post(
        this.smsApiUrl,
        {
          recipients: [phoneNumber],
          body: `Your verification code: ${code}. For login visit Heveq, don't share this code to anyone.`,
          sender: this.sender,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`SMS sent successfully to ${phoneNumber}`);
    } catch (error) {
      this.logger.error(
        'Error sending SMS:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to send SMS notification.');
    }
  }

  async sendMail(email: string, code: string) {
    try {
      const msg = {
        to: email,
        from: 'info@saudi-equipment.com', 
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
      };

      const response = await sgMail.send(msg);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
      throw error;
    }
  }

  async sendContactEmail(contactData: ContactUsDto) {
    try {
      const msg = {
        to: 'info@saudi-equipment.com',
        from: 'info@saudi-equipment.com', 
        replyTo: contactData.email,
        subject: `(from: ${contactData.email})`,
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
      };

      await sgMail.send(msg);
     
      this.logger.log(`Contact form email sent from ${contactData.email}`);
    } catch (error) {
      this.logger.error('Failed to send contact form email', error);
      throw error;
    }
  }

  async sendAdNotificationToAllSubscribed(user: User, adDetails: any): Promise<void> {
    try {
      const notification: any = {
        app_id: this.configService.get<string>('ONESIGNAL_APP_ID'),
        included_segments: ['Subscribed Users'], // or 'All' if not using segments
  
        // Message content
        headings: { en: `New Ad from ${user.name}` },
        contents: { en: adDetails.titleAr },
  
        // Custom Data Payload
        data: {
          adId: adDetails.adId,
          type: 'NEW_AD',
          userId: user.id
        },
  
        // Platform-specific tweaks
        ios_badgeType: 'Increase',
        ios_badgeCount: 1,
        // android_channel_id: this.configService.get<string>('ONESIGNAL_ANDROID_CHANNEL_ID'),
        // small_icon: 'ic_stat_onesignal_default', 
        // large_icon: 'https://example.com/logo.png', 
  
        // Filters (e.g., exclude ad creator)
        filters: [
          {
            field: 'user_id',
            operator: '!=',
            value: user.id
          }
        ],
  
        // Optional web push targeting
        // web_push_topic: 'new-ads',
        // url: `https://yourdomain.com/ad/${adDetails.adId}`, // Deep linking
      };
  
      const result = await this.oneSignalService.createNotification(notification);
      // console.log('Raw result:', JSON.stringify(result, null, 2));

      this.logger.debug('Notification sent:', result);
    } catch (error) {
      this.logger.error('Notification send failed', error);
      throw error;
    }
  }

}
