import {
  Body,
  Controller,
  HttpStatus,
  Post,
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


@Controller('newsletter')
export class NewsletterController {
  constructor(
    private readonly newsLetterService: NewsletterService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @Post('contact-us')
  async createContactUs(
    @Req() req: Request,
    @Res() response,
    @GetUser() user: User,
    @Body() payload: ContactUsDto,
  ) {
    try {
      const data = await this.newsLetterService.createContactUs(user, payload);
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
}
