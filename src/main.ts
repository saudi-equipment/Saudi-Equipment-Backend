import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { JwtAuthGuard } from './auth/guard/jwt.guard';
import { CheckUserAccountGuard } from './middleware/check.user.account.middleware';
import { UserService } from './user/user.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.join(__dirname, '..', 'public'));
  const options = new DocumentBuilder()
    .setTitle('Saudi-Equipments')
    .setDescription('This is the Saudi-Equipments APIs documentation')
    .setVersion('1.0')
    .build();
  app.use(morgan('dev'));

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const userService = app.get(UserService); 
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }),
  );
  
  app.enableCors();
  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new CheckUserAccountGuard(userService)
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = configService.get<number>('PORT');

  
  await app.listen(port, () => {
    Logger.log(`Application is running on port ${port}`);
  });
}
bootstrap();
