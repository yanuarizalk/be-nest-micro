import {
  IsAlphanumeric,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum Gender {
  Male = 'M',
  Female = 'F',
}

export class CreateUserDto {
  constructor(data: CreateUserDto) {
    this.email = data.email;
    this.username = data.username;
    this.password = data.password;
  }

  @ApiProperty({
    example: 'dummy.01@yanuarizal.net',
    description: "User's email",
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'dummy01',
    description: 'Username',
    required: true,
  })
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(30)
  username: string;

  @ApiProperty({
    example: 'password',
    description:
      "User's password, with rule min 6 length, atleast contains a symbol, a number, and both lowercase & uppercase character",
    required: true,
  })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minNumbers: 1,
    minSymbols: 1,
    minLowercase: 1,
    minUppercase: 1,
  })
  password: string;
}

export class UpsertProfileDto {
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

  /* @ApiProperty({ 
    example: Horoscope.Cancer, description: 'User\'s horoscope',
    enum: Horoscope,
  })
  @IsEnum(Horoscope)
  horoscope: string;

  @ApiProperty({ 
    example: Zodiac.Monkey, description: 'User\'s zodiac',
    enum: Zodiac,
  })
  @IsEnum(Zodiac)
  zodiac: string; */

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
