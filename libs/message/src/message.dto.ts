import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Message } from './message.schema';

export class LocationDto {
  @ApiProperty({
    example: 3.0815909567646895,
    description: 'Latitude coordinate',
    required: true,
  })
  @IsLatitude()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    example: 101.67401023796555,
    description: 'Longitude coordinate',
    required: true,
  })
  @IsLongitude()
  @IsNotEmpty()
  lng: number;

  @ApiProperty({
    example: 'Office Address',
    description: 'Address detail description',
    required: false,
  })
  @MaxLength(200)
  desc: string;
}

export class ContactDto {
  @ApiProperty({
    required: true,
    description: 'Contact name',
    example: 'Dumy Wan',
  })
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Phone number',
    example: [
      {
        number: '+62811111111',
        label: 'mobile',
      },
    ],
  })
  @MaxLength(50)
  phones: { number: string; label: string }[];

  @ApiProperty({
    description: 'Email address',
    example: [
      {
        address: 'dummy.01@yanuarizal.net',
        label: 'home',
      },
    ],
  })
  email: { address: string; label: string }[];

  @ApiProperty({
    description: "Person's address",
    example: [
      {
        address: 'Earth 404',
        label: 'mobile',
      },
    ],
  })
  address: { address: string; label: string }[];

  @ApiProperty({
    description: 'Organization related',
    example: [
      {
        name: 'Mimir corp',
        label: 'work',
      },
    ],
  })
  org: { name: string; label: string }[];

  @ApiProperty({
    description: 'Phone number',
    example: ['friend'],
  })
  relationship: string[];

  @ApiProperty({
    description: 'Person remark',
  })
  note: string;
}

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

  @ApiProperty({
    required: false,
    type: LocationDto,
  })
  @IsOptional()
  @Transform(
    (v) => {
      try {
        return typeof v.value == 'string' ? JSON.parse(v.value) : v.value;
      } catch {
        return {};
      }
    },
    { toClassOnly: true },
  )
  @Expose({
    name: 'loc',
    toPlainOnly: true,
  })
  location: LocationDto;

  @ApiProperty({
    required: false,
    type: ContactDto,
  })
  @IsOptional()
  @Transform(
    (v) => {
      try {
        return typeof v.value == 'string' ? JSON.parse(v.value) : v.value;
      } catch {
        return {};
      }
    },
    { toClassOnly: true },
  )
  contact: ContactDto;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
    description:
      "When using 'application/json', the field can be filled with base64 string. \n Uploaded file can be accessed from $BASE_URL/message/:message_id",
  })
  files: Array<Express.Multer.File> | string[];

  toData(): Message {
    return new Message(this);
  }
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
