import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { UserRole } from 'src/enums';
import { User } from 'src/schemas/user/user.schema';
import { GetUser } from 'src/decorators/user.decorator';
import { ContactUsDto } from './dtos/contact.us.dto';
import { Public } from 'src/decorators/public.routes.decorator';
import { GetAllContactListQueryDto } from './dtos/get.all.contact.us.query.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsLetterService: NewsletterService) {}

  @Public()
  @Post('contact-us')
  async createContactUs(@Res() response, @Body() payload: ContactUsDto) {
    try {
      const data = await this.newsLetterService.createContactUs(payload);
      return response
        .status(HttpStatus.CREATED)
        .json({ message: 'contact us created successfully', data });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'An error occurred while creating the ad',
      });
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('list')
  async getAllContactList(@Query() query: GetAllContactListQueryDto) {
    return await this.newsLetterService.getAllContactList(query);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.newsLetterService.delete(id);
    return {
      statusCode: 200,
      message: 'inquery deleted successfully',
    };
  }
}
