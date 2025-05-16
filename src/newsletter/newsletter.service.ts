import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsLetterStore } from 'src/data-stores/newsletter/newsletter.store';
import { ContactUsDto } from './dtos/contact.us.dto';
import { NotificationService } from 'src/notification/notification.service';
import { GetAllContactListQueryDto } from './dtos/get.all.contact.us.query.dto';
import { getPagination } from 'src/utils';
import { DigitalOceanService } from 'src/digital.ocean/digital.ocean.service';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly newsLetterStore: NewsLetterStore,
    private readonly notificationService: NotificationService,
    private readonly digitalOceanService: DigitalOceanService,
  ) {}

  async createContactUs(
    payload: ContactUsDto,
    attachment?: Express.Multer.File,
  ) {
    try {
      let attachmentUrl = null;

      if (attachment) {
        attachmentUrl =
          await this.digitalOceanService.uploadFileToSpaces(attachment);
      }

      const data = await this.newsLetterStore.createContactUs(
        payload,
        attachmentUrl,
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    return await this.newsLetterStore.delete(id);
  }

  async getAllContactList(query: GetAllContactListQueryDto) {
    try {
      const { page, limit } = query;
      const { skip, limit: currentLimit } = getPagination({ page, limit });

      const users = await this.newsLetterStore.getAllContactList(
        query,
        skip,
        currentLimit,
      );

      if (!users) {
        throw new NotFoundException('Queries not found');
      }

      return users;
    } catch (error) {
      throw error;
    }
  }
}
