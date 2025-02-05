import { Body, Controller, Post, Put, Req } from '@nestjs/common';
import { CreatePaymentDto } from './dtos/create.payment.dto';
import { PaymentService } from './payment.service';

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
      if (payload.paymentStatus === 'paid') {
        return await this.paymentService.createSubscription(payload);
      }

      return { message: "Api call failed becuase the payment is failed" };
    } catch (error) {
      throw error;
    }
  }

  @Put('promote-ad')
  async promoteAd(@Body() payload: any) {
    try {
      if(payload.paymentStatus === 'paid'){
        return await this.paymentService.promoteAd(payload);
      }
      
      return { message: "Api call failed becuase the payment is failed" };
    } catch (error) {
      throw error
    }
  }
}
