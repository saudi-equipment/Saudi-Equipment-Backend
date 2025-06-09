import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OneSignalClient } from './onesignal.client';

@Injectable()
export class OneSignalService {
  constructor(
    private readonly configService: ConfigService,
    private readonly oneSignalClient: OneSignalClient,
  ) {}

  async addUserToOneSignal(email: string) {
    const payload = {
      app_id: this.configService.get<string>('ONESIGNAL_APP_ID'),
      identifier: email,
      device_type: 11,
    };

    try {
      await this.oneSignalClient.post('/api/v1/players', payload);
    } catch (error) {
      throw new Error('Failed to add user to OneSignal');
    }
  }

  async sendEmailWithTemplate(payload: any) {
    const customDataPayload = {
      firstName: payload.firstName || undefined,
      lastName: payload.lastName || undefined,
      groupName: payload.groupName || undefined,
      createdBy: payload.createdBy || undefined,
      createdAt: payload.createdAt || undefined,
      email: payload.email || undefined,
      otp: payload.otp || undefined,
      message: payload.message || undefined,
    };

    try {
      let data = {
        app_id: this.configService.get<string>('ONESIGNAL_APP_ID'),
        identifier: payload.email,
        template_id: payload.templateId,
        include_email_tokens: [payload.email],
        email_subject: payload.subject,
        custom_data: customDataPayload,
      };
      if (payload.receiverEmail) {
        data = {
          app_id: this.configService.get<string>('ONESIGNAL_APP_ID'),
          identifier: payload.receiverEmail,
          template_id: payload.templateId,
          include_email_tokens: [payload.receiverEmail],
          email_subject: payload.subject,
          custom_data: customDataPayload,
        };
      }

      await this.oneSignalClient.post('/api/v1/notifications', data);
    } catch (error) {
      throw error;
    }
  }
}
