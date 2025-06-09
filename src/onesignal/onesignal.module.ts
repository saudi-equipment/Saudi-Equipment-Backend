import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OneSignalService } from './onesignal.service';
import { OneSignalClient } from './onesignal.client';



@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://onesignal.com',
      headers: {
        Accept: 'application/json',
      },
    }),
  ],
  controllers: [],
  providers: [OneSignalService, OneSignalClient],
  exports: [OneSignalService],
})
export class OneSignalModule {}
