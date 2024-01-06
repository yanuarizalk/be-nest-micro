import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { StreamGateway } from './stream.gateway';
import { UserModule } from '@app/user';
import { CONSUMER_QUEUE, MessageModule } from '@app/message';
import configuration from 'config/configuration';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MicroserviceOptions, RmqOptions, Transport } from '@nestjs/microservices';
import { ConsumerController } from './consumer.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '@app/modules/auth/jwt.guard';
import { AppModule } from '@app/modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: configuration().database.uri,
      }),
    }),
    JwtModule.register({
      secret: configuration().secrets.jwt,
    }),
    AppModule,
    UserModule,
    MessageModule.register(StreamModule.consumerOption(true) as RmqOptions),
  ],
  controllers: [ConsumerController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    JwtGuard,
    StreamService,
    StreamGateway,
  ],
})
export class StreamModule {
  // for publisher: nack should be true to avoid runtime error
  static consumerOption(noAck: boolean = false): MicroserviceOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [configuration().broker.uri],
        queue: configuration().broker.queue ?? CONSUMER_QUEUE,
        persistent: true,
        noAck: noAck,
        queueOptions: {
          durable: true,
          arguments: {
            'x-queue-type': 'quorum',
          },
        },
      },
    };
  }
}
