import { UserService } from '@app/user';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}
  
  async login(usernameOrEmail, password: string): Promise<any> {
    const user = await this.userService.findOne(usernameOrEmail, usernameOrEmail);

    if (!user) {
      throw new NotFoundException();
    }

    if (await !bcrypt.compare(password, user.password))
      throw new UnauthorizedException();

    const payload = {
      sub: user._id, username: user.username
    }

    return {
      token: await this.jwtService.signAsync(payload),
      user
    };
  }
}
