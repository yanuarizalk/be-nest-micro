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
import { ApiService } from './api.service';
import { UpsertProfileDto } from '@app/user/user.dto';
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
import { plainToClass } from 'class-transformer';

const ERR_INVALID_ID = new BadRequestException('Invalid identifier');
const ERR_USER_NOT_FOUND = new NotFoundException('User not found');

@ApiTags('user')
@ApiBearerAuth()
@Controller()
export class ApiController {
  // constructor(private readonly apiService: ApiService) {}
  constructor(
    private readonly apiService: ApiService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  @Get(['getProfile', 'getProfile/:id'])
  @ApiParam({
    name: 'id',
    required: false,
  })
  @ApiQuery({
    name: 'detail',
    description: 'bool. Give detailed user, show username & email',
    example: 'true',
    required: false,
  })
  async getProfile(
    @Param('id') id: string,
    @Request() req: Request,
    @Query('detail') detailed: string,
  ) {
    if (!id) {
      id = req['user'].sub;
    } else {
      if (!Types.ObjectId.isValid(id)) throw ERR_INVALID_ID;
    }

    const user = await this.userService.findId(id);
    if (!user) {
      throw ERR_USER_NOT_FOUND;
    }

    return detailed == 'true' ? user : user.profileOnly();
  }

  @Post('createProfile')
  createProfile(@Request() req: Request, @Body() dto: UpsertProfileDto) {
    const updatedProfile = this.userService.update(req['user'].sub, dto);

    return updatedProfile;
  }

  @ApiConsumes('multipart/form-data')
  @Put('updateProfile')
  @UseInterceptors(FileInterceptor('file'))
  updateProfile(
    @Request() req: Request,
    @Body() dto: UpsertProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5124000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const updatedProfile = this.userService.update(req['user'].sub, dto);

    return updatedProfile;
  }

  @Get('viewMessages')
  @ApiQuery({ type: ViewMessagesDto })
  async viewMessages(@Query() query, @Request() req: Request) {
    const dto = plainToClass(ViewMessagesDto, query, {
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

    dto.ownerId = req['user'].sub;

    return this.messageService.view(dto);
  }

  @Post('sendMessage')
  async sendMessage(@Body() dto: PublishMessageDto, @Request() req: Request) {
    dto.sender = req['user'].sub;

    if (!Types.ObjectId.isValid(dto.receiver)) throw ERR_INVALID_ID;

    const receiver = await this.userService.findId(dto.receiver);
    if (!receiver) {
      throw ERR_USER_NOT_FOUND;
    }

    Logger.debug(`User ${dto.sender} send a messsage to ${dto.receiver}`);

    return this.messageService.publish(dto);
  }
}
