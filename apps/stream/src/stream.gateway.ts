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
  ConnectedSocket,
  MessageBody,
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

  setSocketTimeout(socket: Socket): NodeJS.Timeout {
    const timeOut = configuration().gateway.timeout;
    if (Number.isNaN(timeOut) || timeOut <= 0) {
      return;
    }

    return setTimeout(() => {
      Logger.debug(
        `disconnecting client ${socket.id} because of socket timeout`,
      );
      socket.disconnect(true);
    }, configuration().gateway.timeout * 1000);
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

    client.data['ping'] = {
      time: new Date().getTime(),
      callbackId: this.setSocketTimeout(client),
    };
  }

  // save resource, disconnect client when they rn't responding.
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data) {
    const PONG = 'pong!';

    const timeOut = configuration().gateway.timeout;
    if (!Number.isNaN(timeOut) && timeOut > 0) {
      clearTimeout(client.data['ping'].callbackId);
      client.data['ping'] = {
        time: new Date().getTime(),
        callbackId: this.setSocketTimeout(client),
      };
    }

    if (data == 'ping') {
      client.emit('ping', PONG);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, data) {
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

    return this.messageService.publish(dto);
  }
}
