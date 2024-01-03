import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Max, Min } from 'class-validator';

export class PublishMessageDto {
  @ApiProperty({
    example: 'hi! how r u?',
    description: 'Message text to be send',
    required: true,
  })
  @Length(1, 200)
  text: string;

  sender: string;

  @ApiProperty({
    example: '6594f3457beb040001f928db',
    description: 'User id of receiver',
    required: true,
  })
  @IsNotEmpty()
  receiver: string;
}

export class ViewMessagesDto {
  @ApiProperty({
    example: 1,
    description: 'Paginate current page',
    required: false,
  })
  @Min(1)
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Paginate message size, min: 10, max: 100',
    required: false,
  })
  @Min(10)
  @Max(100)
  pageSize: number;

  @ApiProperty({
    example: '6594f3457beb040001f928db',
    description: 'User id',
    required: false,
  })
  userId: string;

  ownerId: string; // authenticated user
}
