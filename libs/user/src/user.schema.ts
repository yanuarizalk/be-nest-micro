import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Profile } from './profile.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;
}

export class UserProfile extends User {
  profile: Profile & Profile[];

  profileOnly() {}
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.profileOnly = function () {
  const result: any = {};

  result.id = this._id;
  result.displayName = this.displayName;
  result.interests = this.interests;
  result.gender = this.gender;
  result.height = this.height;
  result.weight = this.weight;
  result.birthDate = this.birthDate;
  result.horoscope = this.horoscope;
  result.zodiac = this.zodiac;

  return result;
};

export function UserFactory() {
  const schema = UserSchema;
  schema.pre('save', async function (next) {
    this.password = await bcrypt.hash(String(this.password), 10);

    next();
  });

  schema.set('toJSON', {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  });

  return schema;
}
