import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { PaymentService } from 'src/payment/payment.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('moyasar')
  async handleMoyasarWebhook(@Req() req) {
    try {
      const payload = req.body;

      if (!payload.id || !payload.status) {
        throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
      }

      if (payload.status === 'paid') {
        // await this.paymentService.processSuccessfulPayment(payload);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw new HttpException(
        'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
