import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationModule } from './config/configuration.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NotificationController } from './notification/notification.controller';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';
import { AdModule } from './ads/ad.module';
import { DigitalOceanModule } from './digital.ocean/digital.ocean.module';
import { PaymentModule } from './payment/payment.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ConfigurationModule,
    AuthModule,
    UserModule,
    NotificationModule,
    AdModule,
    DigitalOceanModule,
    PaymentModule,
    WebhooksModule,
    AdminModule,
  ],
  controllers: [AppController, NotificationController],
  providers: [AppService, NotificationService],
})
export class AppModule {}
