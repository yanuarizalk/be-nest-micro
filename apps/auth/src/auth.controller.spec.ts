import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CreateUserDto } from '@app/user/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@app/user';
import mongoose from 'mongoose';
import { HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;

  const createUser = jest.fn();

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findId: jest.fn(),
            update: jest.fn(),
            create: createUser,
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('register', () => {
    const payload = {
      email: 'test@mail.com',
      username: 'test',
      password: 'password',
    };
    it('should be error index key exist', () => {
      createUser.mockRejectedValueOnce({
        code: 11000,
        keyValue: {
          username: 'test',
        },
      });
      expect(
        authController.register(new CreateUserDto(payload)),
      ).rejects.toEqual(
        new HttpException(`username of test already been used`, 400),
      );
    });

    it('should be success', () => {
      createUser.mockResolvedValue(payload);
      expect(
        authController.register(new CreateUserDto(payload)),
      ).resolves.toEqual(payload);
    });
  });
});
