import { Module } from '@nestjs/common';
import { CHAT_SERVICE, MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageFactory } from './message.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Message.name,
        useFactory: MessageFactory,
      },
    ]),
    ClientsModule.register([
      {
        name: CHAT_SERVICE,
        transport: Transport.TCP,
      },
    ]),
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
