import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { UserService } from '@app/user';
import { MessageService } from '@app/message';
import { Messages } from '@app/message/message.schema';
import { ProfileService } from '@app/user/profile.service';
// import { ModuleMocker } from 'jest-mock';

// const moduleMocker = new ModuleMocker(global);

describe('ProfileController', () => {
  let apiController: ProfileController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
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

    apiController = app.get<ProfileController>(ProfileController);
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
});
