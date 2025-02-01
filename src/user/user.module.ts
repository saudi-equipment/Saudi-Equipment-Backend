import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from 'src/schemas/user/user.schema';
import { UserStore } from 'src/data-stores/user/user.store';
import { NotificationModule } from 'src/notification/notification.module';
import { AuthModule } from 'src/auth/auth.module';
import { AdModule } from 'src/ads/ad.module';
import { adsSchema } from 'src/schemas/ad/ad.schema';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => AuthModule),
    forwardRef(() => AdModule),
    MongooseModule.forFeature([{ name: 'User', schema: userSchema }, { name: 'Ad', schema: adsSchema }, ]),
  ],
  providers: [UserService, UserStore],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
