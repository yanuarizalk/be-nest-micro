import { MessageService } from '@app/message';
import { PublishMessageDto } from '@app/message/message.dto';
import { Message } from '@app/message/message.schema';
import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  Transport,
} from '@nestjs/microservices';
import { StreamGateway } from './stream.gateway';

// const MAX_RETRIES = 3;

@Controller()
export class ConsumerController {
  constructor(
    private readonly messageService: MessageService,
    private readonly streamGateway: StreamGateway,
  ) {}

  @EventPattern('consume')
  getMessage(@Payload() data: PublishMessageDto, @Ctx() context: RmqContext) {
    const msg = context.getMessage();

    this.messageService
      .save(data)
      .then((v: Message) => {
        Logger.debug(`saved message id: ${v._id}`);
        context.getChannelRef().ack(msg);

        this.streamGateway.server.fetchSockets().then((sockets) => {
          let found = 0;
          sockets.every((socket) => {
            if (
              socket.data.user?.sub == v.sender ||
              socket.data.user?.sub == v.receiver
            ) {
              this.streamGateway.server.emit(socket.id, data);
              Logger.debug(
                `saved message emitted to socket with event id '${socket.id}'`,
              );
              found++;
            }

            if (found >= 2) {
              return false;
            }

            return true;
          });
          if (!found) Logger.debug(`no client socket found to send message`);
        });
      })
      .catch((err) => {
        if (msg.fields.redelivered) {
          Logger.error('unable to save message: ', err);
          context.getChannelRef().ack(msg);
          return;
        }
        context.getChannelRef().nack(msg);
      });
  }
}