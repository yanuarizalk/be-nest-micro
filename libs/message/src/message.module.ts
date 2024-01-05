import { DynamicModule, Module } from '@nestjs/common';
import { CONSUMER_SERVICE, MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageFactory } from './message.schema';
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Message.name,
        useFactory: MessageFactory,
      },
    ]),
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {
  static register(opt: RmqOptions): DynamicModule {
    return {
      module: MessageModule,
      imports: [
        ClientsModule.register([
          {
            name: CONSUMER_SERVICE,
            ...opt,
            transport: Transport.RMQ,
          },
        ]),
      ],
    };
  }
}
