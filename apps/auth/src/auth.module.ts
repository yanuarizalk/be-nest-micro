import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '@app/user';
import { JwtModule } from '@nestjs/jwt';
import configuration from 'config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

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
    JwtModule.register({
      secret: configuration().secrets.jwt,
      signOptions: {
        expiresIn: '7d',
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
