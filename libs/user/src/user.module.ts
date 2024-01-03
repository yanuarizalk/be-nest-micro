import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserFactory } from './user.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        // schema: UserSchema,
        useFactory: UserFactory,
      },
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
