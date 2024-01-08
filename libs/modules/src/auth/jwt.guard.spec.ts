import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';

describe('JwtGuard', () => {
  it('should be defined', () => {
    expect(new JwtGuard({} as JwtService)).toBeDefined();
  });
});
