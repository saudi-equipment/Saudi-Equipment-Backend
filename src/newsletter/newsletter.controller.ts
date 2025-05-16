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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { UserRole } from 'src/enums';
import { ContactUsDto } from './dtos/contact.us.dto';
import { Public } from 'src/decorators/public.routes.decorator';
import { GetAllContactListQueryDto } from './dtos/get.all.contact.us.query.dto';
import { validateProfilePicSize } from 'src/utils';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsLetterService: NewsletterService) {}

  @Public()
  @UseInterceptors(FileInterceptor('attachment'))
  @Post('contact-us')
  async createContactUs(
    @Res() response,
    @Body() payload: ContactUsDto,
    @UploadedFile() attachment?: Express.Multer.File,
  ) {
    try {
      if (attachment) {
        validateProfilePicSize(attachment);
      }
      const data = await this.newsLetterService.createContactUs(
        payload,
        attachment,
      );
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
