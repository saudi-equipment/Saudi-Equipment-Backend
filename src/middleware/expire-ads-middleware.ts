import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IUser } from 'src/interfaces/user';
import { PaymentStore } from 'src/data-stores/payment/payment.data.store';
import { AdStore } from 'src/data-stores/ad/ad.store';

@Injectable()
export class ExpireAdsMiddleware implements NestMiddleware {
  constructor(
    private readonly adStore: AdStore,
    private readonly paymentStore: PaymentStore,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as IUser;
    if (user && user.id) {
      console.log("ExpireAdsMiddleware----------------", user.id);
      // await this.paymentStore.expireUserSubscription(user.id);
      await this.adStore.expireUserAds(user.id);
    }
    next();
  }
}
