import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [],
  controllers: [StreamController],
  providers: [StreamService, ChatGateway],
})
export class StreamModule {}
