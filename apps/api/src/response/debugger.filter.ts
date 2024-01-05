import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(InternalServerErrorException)
export class DebuggerFilter implements ExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: exception.cause,
    });
  }
}

/* @Catch()
export class ValidationFilter extends BaseExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost) {
    // super.catch(exception, host);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(400).json({
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.constraints,
    });
  }
} */
