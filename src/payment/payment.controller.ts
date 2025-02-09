import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreatePaymentDto } from './dtos/create.payment.dto';
import { PaymentService } from './payment.service';
import { GetUser } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums';
import { CheckUserAccountGuard } from 'src/middleware/check.user.account.middleware';
@UseGuards(RolesGuard)
@Roles(UserRole.USER)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  
  @Post('create-payment')
  async createPayment(@Body() payload: CreatePaymentDto) {
    console.log('Payload', payload);
    return await this.paymentService.createPayment(payload);
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

  @Post('create-promotion')
  async createPromotionPlan(@Body() payload: any) {
    try {
        const data = await this.paymentService.createPromotionPlan(payload);
        return data
    } catch (error) {
      throw error;
    }
  }

  @Get('get-subscription')
  async getSubscription(@GetUser('id') userId: string) {
    try {
      return await this.paymentService.getSubscription(userId);
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
}
