import { MessageService } from '@app/message';
import { PublishMessageDto } from '@app/message/message.dto';
import { Message, MessageFile } from '@app/message/message.schema';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { StreamGateway } from './stream.gateway';
import { join } from 'path';
import { rename, writeFile } from 'fs/promises';
import configuration from 'config/configuration';
// import { FileTypeResult, fileTypeFromBuffer } from 'file-type';
let fileTypeFromFile, fileTypeFromBuffer;
eval(`import('file-type')`).then((mod) => {
  fileTypeFromFile = mod.fileTypeFromFile;
  fileTypeFromBuffer = mod.fileTypeFromBuffer;
});

// const MAX_RETRIES = 3;

@Controller()
export class ConsumerController {
  constructor(
    private readonly messageService: MessageService,
    private readonly streamGateway: StreamGateway,
  ) {}

  publishMessageToSocket(data, ...profileIds: string[]) {
    if (profileIds.length == 0) return;

    this.streamGateway.server.fetchSockets().then((sockets) => {
      let found = 0;
      sockets.forEach((socket) => {
        if (profileIds.indexOf(socket.data.user?.profileId) >= 0) {
          socket.emit('message', data);
          Logger.debug(
            `saved message emitted to socket with event id '${socket.id}'`,
          );
          found++;
        }
      });
      if (!found) Logger.debug(`no client socket found to send message`);
    });
  }

  async moveUploadedFile(
    files: Express.Multer.File[] | string[],
    messageId: string,
  ): Promise<MessageFile[]> {
    const results: MessageFile[] = [];

    try {
      for (let i = 0; i <= files.length - 1; i++) {
        const fileName = `${messageId}-${i + 1}`;
        const filePath = `${join(
          process.cwd(),
          configuration().storage.messageFile,
          fileName,
        )}`;
        let fileType; // FileTypeResult
        let fileSize, fileOriginName;
        // multer file
        if (files[i].constructor.name == 'Object') {
          const file = files[i] as Express.Multer.File;
          fileType = await fileTypeFromFile(file.path);
          fileOriginName = file.filename;
          fileSize = file.size;
          await rename(file.path, filePath);
          Logger.debug(
            `file '${file.filename}' successfully uploaded to message directory as '${fileName}'`,
          );
        } else if (files[i].constructor.name == 'String') {
          const buff = Buffer.from(files[i] as string, 'base64');
          fileType = await fileTypeFromBuffer(buff);
          fileSize = buff.byteLength;
          await writeFile(filePath, buff);
          Logger.debug(
            `base64 file successfully uploaded to message directory as '${fileName}'`,
          );
        }
        results.push(
          new MessageFile({
            name: fileName,
            mime: fileType.mime,
            size: fileSize,
            originName: fileOriginName,
          }),
        );
      }
    } catch (err) {
      Logger.error(`unable to move uploaded file: ${err}`);
      return Promise.reject(err);
    }

    return results;
    // });
  }

  @EventPattern('message')
  async consumeMessage(
    @Payload() data: PublishMessageDto,
    @Ctx() context: RmqContext,
  ): Promise<Message> {
    const msg = context.getMessage();

    try {
      const v = await this.messageService.save(data);

      // form fields
      if (data.files && data.files.constructor == Array) {
        this.moveUploadedFile(data.files, v._id.toString()).then((files) => {
          v.files = files;
          v.save();
        });
      }

      Logger.log(`saved message id: ${v._id}`);
      context.getChannelRef().ack(msg);

      this.publishMessageToSocket(data, v.sender, v.receiver);

      return v;
    } catch (err) {
      if (msg.fields.redelivered) {
        Logger.error('unable to save message: ', err);
        context.getChannelRef().ack(msg);
        return;
      }
      context.getChannelRef().nack(msg);

      return err;
    }
  }
}
