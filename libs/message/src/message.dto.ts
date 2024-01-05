import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Length, Max, Min } from 'class-validator';

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
  constructor(data: object = null) {
    if (data) {
      this.page = data['page'];
      this.pageSize = data['pageSize'];
      this.userId = data['userId'];
      this.ownerId = data['ownerId'];
    }
  }

  @ApiProperty({
    example: 1,
    description: 'Paginate current page',
    required: false,
  })
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Paginate message size, min: 10, max: 100',
    required: false,
  })
  @IsNumber()
  @Min(10)
  @Max(100)
  pageSize: number;

  @ApiProperty({
    example: '6594f3457beb040001f928db',
    description: 'User id',
    required: false,
  })
  userId: string;

  @ApiProperty({
    example: new Date(),
    description: 'ISO 8601 date (UTC)',
    required: false,
  })
  lastFetch: Date;

  ownerId: string; // authenticated user
}
