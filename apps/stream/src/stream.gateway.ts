import { MessageService } from '@app/message';
import { PublishMessageDto } from '@app/message/message.dto';
import { JwtGuard } from '@app/modules/auth/jwt.guard';
import { ProfileService } from '@app/user/profile.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import configuration from 'config/configuration';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';

const ERR_INVALID_ID = new BadRequestException('Invalid identifier');
const ERR_USER_NOT_FOUND = new NotFoundException('User not found');

@Injectable()
@WebSocketGateway()
export class StreamGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private jwtGuard: JwtGuard,
    private profileService: ProfileService,
    private messageService: MessageService,
  ) {}

  setSocketTimeout(socket: Socket) {
    const timeOut = configuration().gateway.timeout;
    if (Number.isNaN(timeOut) || timeOut <= 0) {
      return;
    }

    clearTimeout(socket.data['ping']?.callbackId);
    socket.data['ping'] = {
      time: new Date().getTime(),
      callbackId: setTimeout(() => {
        Logger.debug(
          `disconnecting client ${socket.id} because of socket timeout`,
        );
        socket.disconnect(true);
      }, configuration().gateway.timeout * 1000),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    Logger.debug('Websocket server initiated');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.jwtGuard.handleWsConnection(client, ...args);
    if (client.disconnected) {
      return;
    }

    this.setSocketTimeout(client);
  }

  // save resource, disconnect client when they rn't responding.
  @SubscribeMessage('ping')
  handlePing(client: Socket, data) {
    const PONG = 'pong!';

    this.setSocketTimeout(client);

    if (data == 'ping') {
      client.emit('ping', PONG);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, data) {
    this.setSocketTimeout(client);

    const dto = plainToClass(PublishMessageDto, data, {
      enableImplicitConversion: true,
    });

    const validation = await validate(dto);

    if (validation.length > 0) {
      const errMessages: string[] = [];
      validation.forEach((message) => {
        if (message.constraints) {
          errMessages.push(...Object.values(message.constraints));
        }
      });

      client.send(new BadRequestException(errMessages).getResponse());
      return;
    }

    dto.sender = client.data['user'].profileId;

    if (!Types.ObjectId.isValid(dto.receiver)) {
      client.send(ERR_INVALID_ID.getResponse());
      return;
    }

    const receiver = await this.profileService.findId(dto.receiver);
    if (!receiver) {
      client.send(ERR_USER_NOT_FOUND.getResponse());
      return;
    }

    Logger.debug(`User ${dto.sender} send a messsage to ${dto.receiver}`);

    return this.messageService.publishMessage(dto);
  }

  @SubscribeMessage('read')
  handleRead(client: Socket, messageId: string[]) {
    this.setSocketTimeout(client);

    const ids: Types.ObjectId[] = [];
    messageId.forEach((v) => {
      if (Types.ObjectId.isValid(v))
        ids.push(Types.ObjectId.createFromHexString(v));
    });

    if (ids.length < 0) {
      client.emit('read', {
        message: 'invalid identifier',
      });
      return;
    }

    return this.messageService.publishRead(ids, client.data['user'].profileId);
  }
}
