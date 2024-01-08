import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Horoscope,
  HoroscopeSign,
  Zodiac,
  ZodiacSign,
} from './datesign/datesign';
import { Document } from 'mongoose';

@Schema()
export class Profile extends Document {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  username: string;

  @Prop()
  userId: string;

  @Prop()
  about: string;

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
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

export function ProfileFactory() {
  const schema = ProfileSchema;
  schema.pre('save', function (next) {
    if (this.birthDate) {
      if (typeof this.birthDate === 'string') {
        this.birthDate = new Date(this.birthDate);
      }

      if (!isNaN(this.birthDate.getTime())) {
        this.set({ horoscope: HoroscopeSign(this.birthDate) });
        this.set({ zodiac: ZodiacSign(this.birthDate) });
      }
    }

    console.log(this.interests, typeof this.interests);
    if (this.interests && typeof this.interests === 'string') {
      const v: string[] = [];
      (this.interests as string).split(',').forEach((interest) => {
        interest = interest.trim().toLowerCase();
        v.push(interest.charAt(0).toUpperCase() + interest.slice(1));
      });

      this.interests = v;
    }

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

  return schema;
}
