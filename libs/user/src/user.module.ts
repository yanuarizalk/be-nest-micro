import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserFactory } from './user.schema';
import { Profile, ProfileFactory } from './profile.schema';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: UserFactory,
      },
      {
        name: Profile.name,
        useFactory: ProfileFactory,
      },
    ]),
  ],
  providers: [UserService, ProfileService],
  exports: [UserService, ProfileService],
})
export class UserModule {}
