import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserProfile } from './user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './user.dto';
import { Profile } from './profile.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User | UserProfile>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  async create(dto: CreateUserDto) {
    const createdUser = await new this.userModel(dto).save();
    if (!createdUser._id) {
      Logger.error(`unable to save user`, createdUser);
      return createdUser;
    }

    const createdProfile = await new this.profileModel({
      _id: createdUser._id,
      userId: createdUser._id,
      username: dto.username,
    }).save();
    if (!createdProfile._id) {
      Logger.error(`unable to save user`, createdProfile);
      return createdProfile;
    }

    return {
      user: createdUser,
      profile: createdProfile,
    };
  }

  async findId(id: string): Promise<User> {
    return this.userModel
      .findById(Types.ObjectId.createFromHexString(id))
      .exec();
  }

  async findOne(username: string, email: string): Promise<UserProfile> {
    const result = await this.userModel
      .aggregate([
        {
          $addFields: {
            userId: {
              $toString: '$_id',
            },
          },
        },
        {
          $lookup: {
            from: 'profiles',
            localField: 'userId',
            foreignField: 'userId',
            as: 'profile',
          },
        },
        {
          $unwind: '$profile',
        },
        {
          $match: {
            $or: [
              {
                'profile.username': username,
              },
              {
                email: email,
              },
            ],
          },
        },
      ])
      .limit(1)
      .exec();

    if (result.length == 0) {
      return null;
    }

    return result[0];
    /* return this.userModel
      .findOne({
        $or: [
          {
            username: username,
          },
          {
            email: email,
          },
        ],
      })
      .exec(); */
  }
}
