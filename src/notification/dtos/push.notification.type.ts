export class NotificationPayloadDto {
    userIds: string[];
    title?: string;
    subtitle?: string;
    content?: string;
    type?: PushNotificationType;
    data?: any;
  }
  
  export enum PushNotificationType {
    ADPUBLISH = 'ADPUBLISH'
  }
  