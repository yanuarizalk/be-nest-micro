import {
  Body,
  Controller,
  HttpException,
  Logger,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '@app/user/user.dto';
import { UserService } from '@app/user';
import { LoginDto } from './auth.tdo';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    try {
      const createdUser = await this.userService.create(dto);
      Logger.debug(
        `User with name ${dto.username} & email ${dto.email} has just been registered`,
      );
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
  async login(@Body() dto: LoginDto) {
    const user = await this.userService.findOne(dto.identity, dto.identity);

    if (!user) {
      throw new NotFoundException();
    }

    if (await !bcrypt.compare(dto.password, user.password))
      throw new UnauthorizedException();

    const payload = {
      sub: user._id,
      username: user.profile.username,
      profileId: user.profile._id,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      _id: user._id,
      email: user.email,
      profile: user.profile,
    };
  }
}
