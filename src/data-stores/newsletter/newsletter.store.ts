import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types} from 'mongoose';
import { UserRole } from 'src/enums';
import { IContactUs } from 'src/interfaces/newsletter/contact.us';
import { ContactUsDto } from 'src/newsletter/dtos/contact.us.dto';
import { GetAllContactListQueryDto } from 'src/newsletter/dtos/get.all.contact.us.query.dto';

@Injectable()
export class NewsLetterStore {
  constructor(
    @InjectModel('ContactUs') private contactUsModel: Model<IContactUs>,
  ) {}

  async createContactUs(payload: ContactUsDto): Promise<IContactUs> {
    const contactUs = new this.contactUsModel({
      ...payload,
    });
    await contactUs.save();
    return contactUs;
  }

   async delete(id: string): Promise<void> {
      return await this.contactUsModel.findByIdAndDelete({
        _id: new Types.ObjectId(id),
      });
    }
  
  async getAllContactList(
    query: GetAllContactListQueryDto,
    skip: number,
    currentLimit: number,
  ): Promise<{
    queries: IContactUs[];
    totalQueries: number;
  }> {
    const { search, sortType, orderType } = query;

    const matchStage: any = {};

    if (search) {
      matchStage.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const sortStage: Record<string, any> = {};

    if (sortType === 'Newest') {
      sortStage.createdAt = -1;
    } else if (sortType === 'Oldest') {
      sortStage.createdAt = 1;
    }

    if (orderType === 'A-Z') {
      sortStage.fullName = 1;
    } else if (orderType === 'Z-A') {
      sortStage.fullName = -1;
    }

    const aggregationPipeline = [
      { $match: matchStage },
      { $sort: Object.keys(sortStage).length ? sortStage : { createdAt: -1 } },
      {
        $facet: {
          queryList: [
            { $skip: skip },
            { $limit: currentLimit },
            {
              $project: {
                fullName: 1,
                phoneNumber: 1,
                email: 1,
                city: 1,
                inquiryType: 1,
                subject: 1,
                message: 1,
                createdAt: 1,
                user: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          queries: '$queryList',
          totalQueries: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ];

    const result = await this.contactUsModel
      .aggregate(aggregationPipeline)
      .exec();

      return {
      totalQueries: result[0]?.totalQueries || 0,
      queries: result[0]?.queries || [],
    };
  }
}