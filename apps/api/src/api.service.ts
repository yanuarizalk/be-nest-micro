import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  register(): string {
    return 'Hello World!';
  }
}
