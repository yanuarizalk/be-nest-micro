import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import configuration from 'config/configuration';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, {
    logger: configuration().inProduction()
      ? ['error', 'fatal']
      : ['debug', 'error', 'fatal', 'log', 'verbose', 'warn'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth API Documentation')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(configuration().port.auth);
}
bootstrap();
