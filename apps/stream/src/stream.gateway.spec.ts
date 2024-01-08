import { Test, TestingModule } from '@nestjs/testing';
import { StreamGateway } from './stream.gateway';
import { JwtGuard } from '@app/modules/auth/jwt.guard';
import { UserService } from '@app/user';
import { MessageService } from '@app/message';
import { Socket } from 'socket.io';
import { ProfileService } from '@app/user/profile.service';

describe('ChatGateway', () => {
  let gateway: StreamGateway;
  // let ioClient: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamGateway,
        {
          provide: JwtGuard,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {
            findId: jest.fn(),
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
            view: jest.fn(),
            publish: jest.fn(),
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<StreamGateway>(StreamGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
