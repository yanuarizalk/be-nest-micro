import { Inject, Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, Messages } from './message.schema';
import { Model, Types } from 'mongoose';
import { PublishMessageDto, ViewMessagesDto } from './message.dto';
import { ClientProxy } from '@nestjs/microservices';

export const CONSUMER_SERVICE = 'CHAT_SERVICE';
export const CONSUMER_QUEUE = 'user_message';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @Optional() @Inject(CONSUMER_SERVICE) private client: ClientProxy,
  ) {}

  async view(dto: ViewMessagesDto): Promise<Messages> {
    let q = this.messageModel.where().getFilter();

    if (dto.profileId) {
      q = {
        $or: [
          {
            sender: dto.ownerId,
            receiver: dto.profileId,
          },
          {
            sender: dto.profileId,
            receiver: dto.ownerId,
          },
        ],
      };
    } else {
      q = {
        $or: [
          {
            receiver: dto.ownerId,
          },
          {
            sender: dto.ownerId,
          },
        ],
      };
    }

    if (dto.lastFetch && isFinite(dto.lastFetch.getTime())) {
      q.$and = [
        {
          _id: {
            $gte: Types.ObjectId.createFromTime(dto.lastFetch.getTime() / 1000),
          },
        },
      ];
    }

    const messages = new Messages();
    const count = await this.messageModel.countDocuments(q).exec();

    if (count <= 0) {
      return messages;
    }

    if (dto.page == null || dto.page < 1) dto.page = 1;

    if (dto.pageSize == null || dto.pageSize < 10) dto.pageSize = 10;
    else if (dto.pageSize > 100) dto.pageSize = 100;

    messages.page = dto.page;
    messages.pageSize = dto.pageSize;
    messages.pageTotal = Math.floor((count - 1) / dto.pageSize) + 1;

    messages.data = await this.messageModel
      .find(q)
      .limit(dto.pageSize)
      .skip((dto.page - 1) * dto.pageSize)
      .sort({ _id: -1 })
      .exec();

    return messages;
  }

  publish(dto: PublishMessageDto) {
    dto.dateTime = new Date();

    return this.client.emit('consume', dto);
  }

  save(dto: PublishMessageDto): Promise<Message> {
    if (typeof dto.dateTime === 'string') {
      dto.dateTime = new Date(dto.dateTime);
    }
    const msg = new this.messageModel(dto);
    const idBasedTime = Types.ObjectId.generate(dto.dateTime.getTime() / 1000);
    msg._id = new Types.ObjectId(idBasedTime);
    return msg.save();
  }
}
