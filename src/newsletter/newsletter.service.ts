import { Injectable } from '@nestjs/common';
import { NewsLetterStore } from 'src/data-stores/newsletter/newsletter.store';
import { User } from 'src/schemas/user/user.schema';
import { ContactUsDto } from './dtos/contact.us.dto';

@Injectable()
export class NewsletterService {
    constructor(
        private readonly newsLetterStore: NewsLetterStore, 
    ){}

    async createContactUs(
        payload: ContactUsDto
    ) {
        try {
            const data = await this.newsLetterStore.createContactUs(payload);
            return data;
        } catch (error) {  
            throw error;
        }
    }
}
