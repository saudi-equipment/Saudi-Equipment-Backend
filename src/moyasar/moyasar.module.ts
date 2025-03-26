import { forwardRef, Module } from '@nestjs/common';
import { MoyasarService } from './moyasar.service';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  providers: [MoyasarService],
  exports: [MoyasarService],
})
export class MoyasarModule {}
