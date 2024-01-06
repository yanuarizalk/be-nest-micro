import { MessageService } from '@app/message';
import { PublishMessageDto } from '@app/message/message.dto';
import { JwtGuard } from '@app/modules/auth/jwt.guard';
import { UserService } from '@app/user';
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
    private userService: UserService,
    private messageService: MessageService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    Logger.debug('Websocket server initiated');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.jwtGuard.handleWsConnection(client, ...args);
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

    dto.sender = client.data['user'].sub;

    if (!Types.ObjectId.isValid(dto.receiver)) {
      client.send(ERR_INVALID_ID.getResponse());
      return;
    }

    const receiver = await this.userService.findId(dto.receiver);
    if (!receiver) {
      client.send(ERR_USER_NOT_FOUND.getResponse());
      return;
    }

    Logger.debug(`User ${dto.sender} send a messsage to ${dto.receiver}`);

    return this.messageService.publish(dto);
  }
}
