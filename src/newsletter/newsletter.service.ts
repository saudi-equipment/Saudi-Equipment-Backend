import { Injectable } from '@nestjs/common';
import { NewsLetterStore } from 'src/data-stores/newsletter/newsletter.store';
import { ContactUsDto } from './dtos/contact.us.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly newsLetterStore: NewsLetterStore,
    private readonly notificationService: NotificationService,
  ) {}

  async createContactUs(payload: ContactUsDto) {
    try {
      const data = await this.newsLetterStore.createContactUs(payload);
      await this.notificationService.sendContactEmail(data);
      return data;
    } catch (error) {
      throw error;
    }
  }
}
