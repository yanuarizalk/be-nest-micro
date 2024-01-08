/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '@app/user';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PublishMessageDto, ViewMessagesDto } from '@app/message/message.dto';
import { MessageService } from '@app/message';
import { validate } from 'class-validator';
import { plainToClassFromExist } from 'class-transformer';
import { ProfileService } from '@app/user/profile.service';
import { CreateProfileDto, UpdateProfileDto } from '@app/user/profile.dto';

const ERR_INVALID_ID = new BadRequestException('Invalid identifier');
const ERR_PROFILE_NOT_FOUND = new NotFoundException('User not found');

@ApiTags('user')
@ApiBearerAuth()
@Controller()
export class ApiController {
  // constructor(private readonly apiService: ApiService) {}
  constructor(
    private readonly profileService: ProfileService,
    private readonly messageService: MessageService,
  ) {}

  @Get(['getProfile', 'getProfile/:id'])
  @ApiParam({
    name: 'id',
    required: false,
  })
  async getProfile(@Param('id') id: string, @Request() req: Request) {
    if (!id) {
      id = req['user'].profileId;
    } else {
      if (!Types.ObjectId.isValid(id)) throw ERR_INVALID_ID;
    }

    const user = await this.profileService.findId(id);
    if (!user) {
      throw ERR_PROFILE_NOT_FOUND;
    }

    return user;
  }

  @Post('createProfile')
  createProfile(@Request() req: Request, @Body() dto: CreateProfileDto) {
    if (!dto.username) {
      // todo: prefix username should be reserved by system only
      dto.username = `username${this.profileService.count()}`;
    }
    dto.userId = req['user'].sub;

    const createdProfile = this.profileService.create(dto);

    return createdProfile;
  }

  @ApiConsumes('multipart/form-data')
  @Put('updateProfile')
  @UseInterceptors(FileInterceptor('file'))
  updateProfile(
    @Request() req: Request,
    @Body() dto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5124000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (dto.username == '' || dto.username == null) {
      dto.username = undefined;
    }
    dto.userId = req['user'].sub;

    const updatedProfile = this.profileService.update(
      req['user'].profileId,
      dto,
    );

    return updatedProfile;
  }

  @Get('viewMessages')
  @ApiQuery({ type: ViewMessagesDto })
  async viewMessages(@Query() query, @Request() req: Request) {
    const dto = plainToClassFromExist(new ViewMessagesDto(), query, {
      enableImplicitConversion: true,
    });

    const validation = await validate(dto);

    if (validation.length > 0) {
      const errMessages: string[] = [];
      validation.forEach((message) => {
        if (message.constraints) {
          errMessages.push(...Object.values(message.constraints));
        }
      });

      throw new BadRequestException(errMessages);
    }

    dto.ownerId = req['user'].profileId;

    return this.messageService.view(dto);
  }

  @Post('sendMessage')
  async sendMessage(@Body() dto: PublishMessageDto, @Request() req: Request) {
    dto.sender = req['user'].profileId;

    if (!Types.ObjectId.isValid(dto.receiver)) throw ERR_INVALID_ID;

    const receiver = await this.profileService.findId(dto.receiver);
    if (!receiver) {
      throw ERR_PROFILE_NOT_FOUND;
    }

    Logger.debug(`User ${dto.sender} send a messsage to ${dto.receiver}`);

    return this.messageService.publish(dto);
  }
}
