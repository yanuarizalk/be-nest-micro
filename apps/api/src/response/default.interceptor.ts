import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class DefaultResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((v) => {
        if (!!v && v.constructor === Array && v.length == 0) {
          v = [];
        } else if (
          !!v &&
          v.constructor === Object &&
          Object.keys(v).length == 0
        ) {
          v = {};
        }
        if (v.data) {
          return {
            message: 'success',
            ...v,
          };
        }

        return {
          message: 'success',
          data: v,
        };
      }),
    );
  }
}
