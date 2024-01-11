/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ProfileService } from '@app/user/profile.service';
import { CreateProfileDto, UpdateProfileDto } from '@app/user/profile.dto';
import { rename } from 'fs/promises';
import { join } from 'path';
import { fileTypeFromFile } from 'file-type';

const ERR_INVALID_ID = new BadRequestException('Invalid identifier');
const ERR_PROFILE_NOT_FOUND = new NotFoundException('User not found');

@ApiTags('profile')
@ApiBearerAuth()
@Controller()
export class ProfileController {
  // constructor(private readonly apiService: ApiService) {}
  constructor(private readonly profileService: ProfileService) {}

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
  async updateProfile(
    @Request() req: Request,
    @Body() dto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5124000 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (dto.username == '' || dto.username == null) {
      dto.username = undefined;
    }
    dto.userId = req['user'].sub;

    if (file && !/image/i.test((await fileTypeFromFile(file.path)).mime)) {
      throw new BadRequestException('Invalid type of uploaded image');
    } else if (file?.path) {
      rename(
        file.path,
        join(process.cwd(), 'public', 'users', 'img', req['user'].profileId),
      )
        .then(() => Logger.debug(`image profile successfully uploaded`))
        .catch((reason) =>
          Logger.error(`unable to move uploaded file: ${reason}`),
        );
    }

    const updatedProfile = this.profileService.update(
      req['user'].profileId,
      dto,
    );

    return updatedProfile;
  }
}
