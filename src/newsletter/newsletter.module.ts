import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { contactUsSchema } from 'src/schemas/newsletter/contact.us.schema';
import { NewsLetterStore } from 'src/data-stores/newsletter/newsletter.store';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ContactUs', schema: contactUsSchema }]),
    NotificationModule,
  ],
  providers: [NewsletterService, NewsLetterStore],
  controllers: [NewsletterController],
})
export class NewsletterModule {}
