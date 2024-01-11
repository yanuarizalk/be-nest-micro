import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { UserService } from '@app/user';
import { MessageService } from '@app/message';
import { BadRequestException } from '@nestjs/common';
import { Messages } from '@app/message/message.schema';
import { ProfileService } from '@app/user/profile.service';
// import { ModuleMocker } from 'jest-mock';

// const moduleMocker = new ModuleMocker(global);

describe('MessageController', () => {
  let apiController: MessageController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
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

    apiController = app.get<MessageController>(MessageController);
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
