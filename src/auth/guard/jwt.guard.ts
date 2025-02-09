import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/decorators/public.routes.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow access without authentication
    }

    // Convert Observable<boolean> to Promise<boolean>
    const result = super.canActivate(context);
    if (result instanceof Observable) {
      return lastValueFrom(result);
    }
    
    return result;
  }
}
