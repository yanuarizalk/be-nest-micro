import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UserModule } from '@app/user';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { CONSUMER_QUEUE, MessageModule } from '@app/message';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { UserMulterOption } from './multer/multer';
import { AppModule } from '@app/modules';
import { JwtGuard } from '@app/modules/auth/jwt.guard';
import { MessageController } from './message.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: configuration().database.uri,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveStaticOptions: {
        cacheControl: true,
      },
    }),
    MulterModule.registerAsync({
      useClass: UserMulterOption,
    }),
    JwtModule.register({
      secret: configuration().secrets.jwt,
    }),
    AppModule,
    UserModule,
    MessageModule.register({
      options: {
        urls: [configuration().broker.uri],
        queue: configuration().broker.queue ?? CONSUMER_QUEUE,
        persistent: true,
        queueOptions: {
          durable: true,
          arguments: {
            'x-queue-type': 'quorum',
          },
        },
      },
    }),
  ],
  controllers: [ProfileController, MessageController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class ApiModule {}
