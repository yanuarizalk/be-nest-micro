import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import configuration from 'config/configuration';
import { ValidationPipe } from '@nestjs/common';
import { DefaultResponseInterceptor } from './response/default.interceptor';
import { DebuggerFilter } from './response/debugger.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('User API Documentation')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: !configuration().inProduction(),
    }),
  );
  app.useGlobalInterceptors(new DefaultResponseInterceptor());
  if (!configuration().inProduction()) {
    app.useGlobalFilters(new DebuggerFilter());
  }

  await app.listen(configuration().port.user);
}
bootstrap();
