import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, Messages } from './message.schema';
import { Model } from 'mongoose';
import { PublishMessageDto, ViewMessagesDto } from './message.dto';
import { ClientProxy, Ctx, RmqContext } from '@nestjs/microservices';

export const CHAT_SERVICE = 'CHAT_SERVICE';

@Injectable()
export class MessageService {
    constructor(@InjectModel(Message.name) private messageModel: Model<Message>, @Inject(CHAT_SERVICE) private client: ClientProxy) {}

    async view(dto: ViewMessagesDto): Promise<Messages | Error> {
        const q = {
            $or: [{
                sender: dto.ownerId,
                receiver: dto.userId
            }, {
                sender: dto.userId,
                receiver: dto.ownerId
            }]
        }
        const messages = new Messages();
        const count = await this.messageModel.countDocuments(q).exec();

        if (count <= 0) {
            return new Messages();
        }

        if (dto.page == null || dto.page < 1)
            dto.page = 1;
        
        if (dto.pageSize == null || dto.pageSize < 10)
            dto.pageSize = 10;
        else if (dto.pageSize > 100)
            dto.pageSize = 100;

        messages.page = dto.page;
        messages.pageSize = dto.pageSize;
        messages.pageTotal = Math.floor((count - 1)/ dto.pageSize) + 1;

        try {
            messages.data = await this.messageModel.find(q).limit(dto.pageSize).skip(dto.page * dto.pageSize).exec();
        } catch (err) {
            return Promise.reject(err);
        }

        return messages;
    }

    async publish(dto: PublishMessageDto): Promise<Message> {
        const msg = new this.messageModel(dto);

        try {
            const msgResult = await msg.save();

            this.client.send({
                receiver: dto.receiver
            }, {
                sender: dto.sender,
                text: dto.text,
                time: msgResult._id.getTimestamp()
            });
    
            return msgResult;
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
