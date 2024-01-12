import { Inject, Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageState, Messages } from './message.schema';
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

  private async setState(setState: MessageState, ...ids: Types.ObjectId[]) {
    return this.messageModel.updateMany(
      {
        _id: {
          $in: ids,
        },
      },
      {
        $set: {
          [`state.${setState}`]: new Date(),
        },
      },
    );
  }

  async updateState(
    setState: MessageState,
    ...data: string[] | Types.ObjectId[] | Message[]
  ) {
    if (data.length <= 0) return;

    const ids: Types.ObjectId[] = [];

    data.forEach((v) => {
      // Message
      if (v.state) {
        if (!v.state.hasOwnProperty(setState)) ids.push(v._id);
      } else if (v.constructor.name == 'String') {
        if (Types.ObjectId.isValid(v))
          ids.push(Types.ObjectId.createFromHexString(v));
      } else ids.push(v);
    });

    if (data.length <= 0) return;

    return this.setState(setState, ...ids);
  }

  async findId(ids: Types.ObjectId[], receiver: string): Promise<Message[]> {
    ids.forEach((v, i) => {
      if (ids.constructor.name == 'String' && Types.ObjectId.isValid(v)) {
        ids[i] = Types.ObjectId.createFromHexString(v.toString());
      }
    });

    return this.messageModel
      .find({
        _id: {
          $in: ids,
        },
        receiver: receiver,
      })
      .exec();
  }

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

    this.updateState(
      MessageState.Delivered,
      ...messages.data.filter((v) => {
        return v.receiver == dto.ownerId;
      }),
    );

    return messages;
  }

  publishMessage(dto: PublishMessageDto) {
    dto.dateTime = new Date();

    return this.client.emit('message', dto);
  }

  publishRead(ids: Types.ObjectId[], profileId: string) {
    return this.client.emit('read', {
      ids,
      profileId,
    });
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
