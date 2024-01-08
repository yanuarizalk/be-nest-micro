import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  constructor(data?: CreateUserDto) {
    if (data) {
      this.email = data.email;
      this.username = data.username;
      this.password = data.password;
    }
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
