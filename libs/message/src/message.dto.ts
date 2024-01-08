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

  @ApiProperty({
    example: '6594f3457beb040001f928db',
    description: 'Profile id of receiver',
    required: true,
  })
  @IsNotEmpty()
  receiver: string;

  sender: string;

  dateTime: Date;
}

export class ViewMessagesDto {
  constructor(data: object = {}) {
    this.fill(data);
  }

  fill(data: object = {}) {
    if (data['page']) this.page = data['page'];
    else this.page = 1;
    if (data['pageSize']) this.pageSize = data['pageSize'];
    else this.pageSize = 10;
    if (data['profileId']) this.profileId = data['profileId'];
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
    description: 'Profile id of specific user',
    required: false,
  })
  profileId: string;

  @ApiProperty({
    example: new Date(),
    description: 'ISO 8601 date (UTC)',
    required: false,
  })
  lastFetch: Date;

  ownerId: string; // authenticated profile id of user
}
