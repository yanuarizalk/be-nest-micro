import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'dummy01',
    description: 'identity could be username or email',
  })
  @IsNotEmpty()
  identity: string;

  @ApiProperty({
    example: 'Par1st@',
  })
  @IsNotEmpty()
  password: string;
}
