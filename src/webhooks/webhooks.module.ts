import { forwardRef, Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [forwardRef(()=> PaymentModule)],
  controllers: [WebhooksController],
  providers: [WebhooksService]
})
export class WebhooksModule {}
