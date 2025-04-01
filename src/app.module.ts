import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationModule } from './config/configuration.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { AdModule } from './ads/ad.module';
import { DigitalOceanModule } from './digital.ocean/digital.ocean.module';
import { PaymentModule } from './payment/payment.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AdminModule } from './admin/admin.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { MoyasarModule } from './moyasar/moyasar.module';
import { BannerAdModule } from './google.ad/banner.ad.module';
import { DashboardModule } from './dashboard/dashboard.module';

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
    NewsletterModule,
    MoyasarModule,
    BannerAdModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
