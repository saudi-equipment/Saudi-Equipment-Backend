import { User } from '../../schemas/user/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import { IContactUs } from 'src/interfaces/newsletter/contact.us';
import { ContactUsDto } from 'src/newsletter/dtos/contact.us.dto';

@Injectable()
export class NewsLetterStore {
  constructor(
    @InjectModel('ContactUs') private contactUsModel: Model<IContactUs>,
  ) {}

  async createContactUs(
    payload: ContactUsDto,
  ): Promise<IContactUs> {
    const contactUs = new this.contactUsModel({
      ...payload
    });
    await contactUs.save();
    return contactUs;
  }
}