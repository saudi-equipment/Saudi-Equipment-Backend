import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
