import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import configuration from 'config/configuration';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { Socket } from 'socket.io';

function extractTokenFromHeader(
  headers: IncomingHttpHeaders,
): string | undefined {
  const [type, token] = headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  handleWsConnection(client: Socket, ...args: any[]) {
    this.jwtService
      .verifyAsync(extractTokenFromHeader(client.handshake.headers), {
        secret: configuration().secrets.jwt,
      })
      .then((payload) => {
        client.data['user'] = payload;
      })
      .catch((err) => {
        client.send({
          message: 'Unathorized',
          error: configuration().inProduction() ? undefined : err,
        });
        client.disconnect(true);
      });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let headers: IncomingHttpHeaders;
    let args: Socket | Request;
    if (context.getType() == 'ws') {
      args = context.switchToWs().getClient<Socket>();
      headers = args.handshake.headers;
    } else {
      args = context.switchToHttp().getRequest<Request>();
      headers = args.headers;
    }
    const token = extractTokenFromHeader(headers);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: configuration().secrets.jwt,
      });

      if (context.getType() == 'ws') {
        (args as Socket).data['user'] = payload;
      } else {
        args['user'] = payload;
      }
    } catch (err) {
      if (context.getType() == 'ws') {
        return false;
      } else {
        throw new UnauthorizedException(err);
      }
    }

    return true;
  }
}
