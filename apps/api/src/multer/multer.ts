import { Injectable } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { join } from 'path';

@Injectable()
export class UserMulterOption implements MulterOptionsFactory {
  createMulterOptions(): MulterOptions | Promise<MulterOptions> {
    return {
      storage: diskStorage({
        destination: join(process.cwd(), 'upload'),
        filename: function (req, file, callback) {
          callback(null, req['user'].profileId);
        },
      }),
    };
  }
}
