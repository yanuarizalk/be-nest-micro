import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto, UpsertProfileDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const createdCat = new this.userModel(dto);
    return createdCat.save();
  }

  async update(id: Types.ObjectId, dto: UpsertProfileDto): Promise<User> {
    const existingUser = await this.userModel.findById(id).exec();

    return existingUser.updateOne(dto);
  }

  async findId(id: string): Promise<User> {
    return this.userModel
      .findById(Types.ObjectId.createFromHexString(id))
      .exec();
  }

  async findOne(username, email: string): Promise<User> {
    return this.userModel
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
      .exec();
  }
}
