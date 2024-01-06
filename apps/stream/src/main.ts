import { NestFactory } from '@nestjs/core';
import { StreamModule } from './stream.module';
import configuration from 'config/configuration';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(StreamModule);
  app.connectMicroservice<MicroserviceOptions>(StreamModule.consumerOption());
  app.startAllMicroservices();

  await app.listen(configuration().port.stream);
}
bootstrap();
