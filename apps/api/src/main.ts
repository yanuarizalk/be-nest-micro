import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import configuration from 'config/configuration';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('User API Documentation')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(configuration().port.user);
}
bootstrap();
