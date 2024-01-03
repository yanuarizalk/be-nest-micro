import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { UserModule } from '@app/user';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { UserMulterOption } from './multer/multer';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';

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
    UserModule,
  ],
  controllers: [ApiController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    ApiService,
  ],
})
export class ApiModule {}
