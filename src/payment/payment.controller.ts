import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GetUser } from 'src/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { Public } from 'src/decorators/public.routes.decorator';
import { MoyasarService } from 'src/moyasar/moyasar.service';
import { CommonQueryDto } from 'src/common/dtos';
@UseGuards(RolesGuard)
@Roles(UserRole.USER)
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly moyasarService: MoyasarService,
  ) {}

  @Post()
  createPayment(@Body() payload: any) {
    try {
      const result = this.paymentService.createPaymentSession(payload);
      return result;
    } catch (error) {
      error;
    }
  }

  @Post('create-subscription')
  async createSubscription(@Body() payload: any) {
    try {
      if (payload.status === 'paid') {
        const data = await this.paymentService.createSubscription(payload);
        return {
          subscription: data.subscription,
          user: data.user,
        };
      }

      return { message: 'Api call failed becuase the payment is failed' };
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Get(':sessionId')
  getPaymentDetails(@Param('sessionId') sessionId: string) {
    if (!sessionId) {
      throw new NotFoundException('Session ID is required');
    }
    return this.paymentService.getPaymentDetails(sessionId);
  }

  @Get('get-subscription')
  async getSubscription(@GetUser('id') userId: string) {
    try {
      return await this.paymentService.getSubscription(userId);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async getAllPaymentDetails(@Query() query: CommonQueryDto) {
    try {
      return await this.paymentService.getAllPaymentDetails(query);
    } catch (error) {
      throw error;
    }
  }

  @Put('promote-ad')
  async promoteAd(@Body() payload: any) {
    try {
      if (payload.status === 'paid') {
        return await this.paymentService.promoteAd(payload);
      }

      return { message: 'Api call failed becuase the payment is failed' };
    } catch (error) {
      throw error;
    }
  }

  @Get('moyasar/:id')
  async getPayment(@Param('id') id: string) {
    return this.moyasarService.getPayment(id);
  }
}
