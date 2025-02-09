import { CanActivate, ExecutionContext, Injectable, HttpStatus } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CheckUserAccountGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    if (!req.user) {
      return true;
    }

    const user = req.user;

    try {
      const userStatus = await this.userService.checkUserAccount(user);
      if (userStatus?.statusCode !== HttpStatus.OK) {
        res.status(userStatus.statusCode).json(userStatus);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Guard error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error in user account check',
      });
      return false;
    }
  }
}
