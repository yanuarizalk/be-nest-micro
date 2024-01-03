import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '@app/user/user.dto';
import { UserService } from '@app/user';
import { LoginDto } from './auth.tdo';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    try {
      const createdUser = await this.userService.create(dto);
      return createdUser;
    } catch (err) {
      if (err.code == 11000) {
        // User already registered
        throw new HttpException(
          `${Object.keys(err.keyValue)[0]} of ${
            Object.values(err.keyValue)[0]
          } already been used`,
          400,
        );
      }
    }
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.identity, dto.password);
  }
}
