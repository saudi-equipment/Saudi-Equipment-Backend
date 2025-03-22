import { UserService } from 'src/user/user.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AdService } from 'src/ads/ad.service';
import { IUser } from 'src/interfaces/user';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class ExpireAdsMiddleware implements NestMiddleware {
  constructor(
    private readonly adService: AdService,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as IUser;
    if (user && user.id) {
      await this.paymentService.expireUserSubscription(user.id);
      await this.adService.expireUserAds(user.id);
    }
    next();
  }
}
