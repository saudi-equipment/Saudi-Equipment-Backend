import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OneSignalModule } from 'onesignal-api-client-nest';

@Module({
  imports: [
    OneSignalModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          appId: configService.get<string>('ONESIGNAL_APP_ID'),

          restApiKey: configService.get<string>('ONESIGNAL_REST_API_KEY'),
        };
      },
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
