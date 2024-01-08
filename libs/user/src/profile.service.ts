import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile } from './profile.schema';
import { CreateProfileDto, UpdateProfileDto } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  async create(dto: CreateProfileDto): Promise<Profile> {
    const createdProfile = new this.profileModel(dto);
    return createdProfile.save();
  }

  async update(id: Types.ObjectId, dto: UpdateProfileDto): Promise<Profile> {
    const existingUser = await this.profileModel.findById(id).exec();

    return existingUser.updateOne(dto);
  }

  async findId(id: string): Promise<Profile> {
    return this.profileModel
      .findById(Types.ObjectId.createFromHexString(id))
      .exec();
  }

  async findUserId(id: string): Promise<Profile[]> {
    return this.profileModel
      .find({
        userId: id,
      })
      .exec();
  }

  async count(): Promise<number> {
    return this.profileModel.countDocuments();
  }
}
