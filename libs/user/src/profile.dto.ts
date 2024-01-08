import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsNumberString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Horoscope, Zodiac } from './datesign/datesign';

enum Gender {
  Male = 'M',
  Female = 'F',
}

export class CreateProfileDto {
  @ApiProperty({
    example: 'yanuarizalk',
    description: 'username',
    required: false,
  })
  username?: string;

  userId: string;

  @ApiProperty({
    example: 150,
    description: 'The height of user, Unit: cm',
    required: false,
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    example: 50,
    description: 'The weight of user, Unit: kg',
    required: false,
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    example: 'A minecraft propler',
    description: 'Tell the others something about you',
    required: false,
  })
  @MaxLength(200)
  about: string;

  @ApiProperty({
    example: 'Mr. Dummy',
    description: 'The name will displayed on the profile screen',
    required: false,
  })
  @MaxLength(50)
  displayName: string;

  @ApiProperty({
    example: 'M',
    description: 'Either M / F',
    required: false,
  })
  @IsEnum(Gender)
  gender: string;

  @ApiProperty({
    example: '2001-01-14',
    description: 'The birth date of the user',
    required: false,
  })
  @IsDateString()
  // @MinDate(new Date('1900-01-01'))
  birthDate: Date;

  readonly horoscope: Horoscope;
  readonly zodiac: Zodiac;

  @ApiProperty({
    example: ['Football', 'Dota2'],
    description: 'The birth date of the user',
    required: false,
  })
  interests: string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description:
      'Uploaded image can be accessed from $BASE_URL/users/img/:user_id',
  })
  file: any;
}

export class UpdateProfileDto {
  @ApiProperty({
    example: 'yanuarizalk',
    description: 'username, make it empty to not change',
    required: false,
  })
  username?: string;

  userId: string;

  @ApiProperty({
    example: 150,
    description: 'The height of user, Unit: cm',
    required: false,
  })
  @IsNumberString()
  height: number;

  @ApiProperty({
    example: 50,
    description: 'The weight of user, Unit: kg',
    required: false,
  })
  @IsNumberString()
  weight: number;

  @ApiProperty({
    example: 'Mr. Dummy',
    description: 'The name will displayed on the profile screen',
    required: false,
  })
  @MaxLength(50)
  displayName: string;

  @ApiProperty({
    example: 'M',
    description: 'Either M / F',
    required: false,
  })
  @IsEnum(Gender)
  gender: string;

  @ApiProperty({
    example: '2001-01-14',
    description: 'The birth date of the user',
    required: false,
  })
  @IsDateString()
  // @MinDate(new Date('1900-01-01'))
  birthDate: Date;

  readonly horoscope: Horoscope;
  readonly zodiac: Zodiac;

  @ApiProperty({
    example: ['Football', 'Dota2'].join(', '),
    description: 'The birth date of the user',
    required: false,
  })
  interests: string | string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description:
      'Uploaded image can be accessed from $BASE_URL/users/img/:user_id',
  })
  file: any;
}
