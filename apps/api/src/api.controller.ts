import { Body, Controller, Get, MaxFileSizeValidator, ParseFilePipe, Post, Put, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateUserDto, UpsertProfileDto } from '@app/user/user.dto';
import { UserService } from '@app/user';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth()
@Controller()
export class ApiController {
  // constructor(private readonly apiService: ApiService) {}
  constructor(private readonly apiService: ApiService, private readonly userService: UserService) {}

  @Get('getProfile')
  getProfile(): string {
    return 'zz';
  }

  @Post('createProfile')
  createProfile(@Request() req: Request, @Body() dto: UpsertProfileDto) {
    let updatedProfile = this.userService.update(req['user'].sub, dto);

    return updatedProfile;
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @Put('updateProfile')
  @UseInterceptors(FileInterceptor('file'))
  updateProfile(@Request() req: Request, @Body() dto: UpsertProfileDto, @UploadedFile(new ParseFilePipe({
    fileIsRequired: false,
    validators: [new MaxFileSizeValidator({maxSize: 5124000})]
  })) file: Express.Multer.File) {
    let updatedProfile = this.userService.update(req['user'].sub, dto);

    return updatedProfile;
  }

  @ApiBearerAuth()
  @Get('viewMessages')
  viewMessages(): string {
    return 'hh';
  }

  @ApiBearerAuth()
  @Post('sendMessage')
  sendMessage(): string {
    return 'hh';
  }
}
