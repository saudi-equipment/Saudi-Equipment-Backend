import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.routes.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Public()
  @Get('/api')
  getHello(): string {
    return this.appService.getHello();
  }
}
