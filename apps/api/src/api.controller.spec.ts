import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { UserService } from '@app/user';
import { MessageService } from '@app/message';
import { BadRequestException } from '@nestjs/common';
import { Messages } from '@app/message/message.schema';
import { ProfileService } from '@app/user/profile.service';
// import { ModuleMocker } from 'jest-mock';

// const moduleMocker = new ModuleMocker(global);

describe('ApiController', () => {
  let apiController: ApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findId: jest.fn() /* .mockResolvedValue({
              username: 'gim',
              email: 'gim@bot.net',
            }) */,
            update: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: ProfileService,
          useValue: {
            findId: jest.fn(),
            findUserId: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: MessageService,
          useValue: {
            view: jest.fn().mockResolvedValue(new Messages()),
            publish: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    })
      // .overrideProvider(JwtGuard)
      // .useClass(MockAuthGuard)
      .compile();

    apiController = app.get<ApiController>(ApiController);
  });

  describe('get profile', () => {
    it('should be invalid id', async () => {
      await expect(
        apiController.getProfile('user id', {
          user: {
            sub: 'uid',
          },
        } as unknown as Request),
      ).rejects.toThrow('Invalid identifier');
    });

    it('should be not found', async () => {
      await expect(
        apiController.getProfile(undefined, {
          user: {
            sub: 'missing',
          },
        } as unknown as Request),
      ).rejects.toThrow('User not found');
    });
  });

  describe('view messages', () => {
    it('should be fail validate', async () => {
      await expect(
        apiController.viewMessages(
          {
            page: 'invalid type',
          },
          {
            user: {
              sub: 'uid',
            },
          } as unknown as Request,
        ),
      ).rejects.toEqual(
        new BadRequestException([
          'page must not be less than 1',
          'page must be a number conforming to the specified constraints',
        ]),
      );
    });

    it('empty', async () => {
      await expect(
        apiController.viewMessages({}, {
          user: {
            sub: 'uid',
          },
        } as unknown as Request),
      ).resolves.toEqual(new Messages());
    });
  });
});
