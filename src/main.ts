import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('Saudi-Equipments')
    .setDescription('This is the Saudi-Equipments APIs documentation')
    .setVersion('1.0')
    .build();
  app.use(morgan('dev'));
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  const configService = app.get(ConfigService);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }),
  );
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = configService.get<number>('PORT');

  await app.listen(port, () => {
    Logger.log(`Application is running on port ${port}`);
  });
}
bootstrap();
