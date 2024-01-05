import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  Horoscope,
  HoroscopeSign,
  Zodiac,
  ZodiacSign,
} from './datesign/datesign';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  username: string;

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

  @Prop([String])
  interests: string[];

  @Prop()
  displayName: string;

  @Prop({
    type: String,
    enum: ['M', 'F'],
  })
  gender: string;

  @Prop(Date)
  birthDate: Date;

  @Prop({
    type: String,
    enum: Horoscope,
  })
  horoscope: string;

  @Prop({
    type: String,
    enum: Zodiac,
  })
  zodiac: string;

  @Prop()
  height: number;

  @Prop()
  weight: number;

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
  schema.pre('updateOne', function () {
    let birthDate = this.get('birthDate');
    const interests = this.get('interests');

    if (birthDate) {
      if (typeof birthDate === 'string') {
        birthDate = new Date(birthDate);
      }

      if (!isNaN(birthDate)) {
        this.set({ horoscope: HoroscopeSign(birthDate) });
        this.set({ zodiac: ZodiacSign(birthDate) });
      }
    }

    if (interests && typeof interests === 'string') {
      const v: string[] = [];
      interests.split(',').forEach((interest) => {
        interest = interest.trim().toLowerCase();
        v.push(interest.charAt(0).toUpperCase() + interest.slice(1));
      });

      this.set({ interests: v });
    }
  });

  schema.set('toJSON', {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  });

  return schema;
}
