import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PublishMessageDto, ViewMessagesDto } from '@app/message/message.dto';
import { MessageService } from '@app/message';
import { validate } from 'class-validator';
import { plainToClassFromExist } from 'class-transformer';
import { ProfileService } from '@app/user/profile.service';
import { FilesInterceptor } from '@nestjs/platform-express';

const ERR_INVALID_ID = new BadRequestException('Invalid identifier');
const ERR_PROFILE_NOT_FOUND = new NotFoundException('User not found');

@ApiTags('message')
@ApiBearerAuth()
@Controller()
export class MessageController {
  // constructor(private readonly apiService: ApiService) {}
  constructor(
    private readonly profileService: ProfileService,
    private readonly messageService: MessageService,
  ) {}

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
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessage(
    @Body() dto: PublishMessageDto,
    @Request() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    dto.sender = req['user'].profileId;

    if (!Types.ObjectId.isValid(dto.receiver)) throw ERR_INVALID_ID;

    const receiver = await this.profileService.findId(dto.receiver);
    if (!receiver) {
      throw ERR_PROFILE_NOT_FOUND;
    }

    Logger.log(`User ${dto.sender} send a messsage to ${dto.receiver}`);

    if (files && files.length > 0) {
      dto.files = files;
    }

    return this.messageService.publish(dto);
  }
}
