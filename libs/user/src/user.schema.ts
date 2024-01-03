import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types, UpdateQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Horoscope, HoroscopeSign, Zodiac, ZodiacSign } from './datesign/datesign';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends Document {
    @Prop({
        required: true,
        unique: true,
        index: true
    })
    username: string;

    @Prop({
        required: true,
        unique: true,
        index: true
    })
    email: string;

    @Prop({
        required: true
    })
    password: string;

    @Prop([String])
    interests: string[];

    @Prop()
    displayName: string;

    @Prop({
        type: String,
        enum: ['M', 'F']
    })
    gender: string;

    @Prop(Date)
    birthDate: Date;

    @Prop({
        type: String,
        enum: Horoscope
    })
    horoscope: string;

    @Prop({
        type: String,
        enum: Zodiac
    })
    zodiac: string;

    @Prop()
    height: number;

    @Prop()
    weight: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

export function UserFactory() {
    const schema = UserSchema;
    schema.pre('save', async function (next) {
        this.password = await bcrypt.hash(String(this.password), 10);

        next()
    })
    schema.pre('updateOne', function () {        
        let birthDate = this.get('birthDate');
        let interests = this.get('interests');

        if (birthDate) {
            if (typeof birthDate === 'string') {
                birthDate = new Date(birthDate);
            }

            if (!isNaN(birthDate)) {
                this.set({horoscope: HoroscopeSign(birthDate)});
                this.set({zodiac: ZodiacSign(birthDate)});
            }
        }

        if (interests && typeof interests === 'string') {
            let v: string[] = [];
            interests.split(',').forEach((interest) => {
                interest = interest.trim().toLowerCase();
                v.push(interest.charAt(0).toUpperCase() + interest.slice(1));
            })

            this.set({interests: v});
        }
    })

    schema.set('toJSON', {
        transform: (doc, ret, opt) => {
            delete ret.password;
            return ret;
        }
    })

    return schema;
}
