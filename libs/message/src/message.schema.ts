import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MaxLength } from "class-validator";

@Schema()
export class Message extends Document {
    @Prop({
        required: true, index: true, unique: false,
    })
    receiver: string;

    @Prop({
        required: true, index: true, unique: false,
    })
    sender: string;

    @Prop()
    @MaxLength(200)
    text: string;

    // 0: published or stored, 1: retrieved
    @Prop()
    state: number;
}

export class Messages {
    data: Message[];
    page: number;
    pageSize: number;
    pageTotal: number;
    err?: Error;

    error(err: Error) {
        this.err = err;
        return this;
    }
}

export class LinkedMessage extends Document {

}

export const MessageSchema = SchemaFactory.createForClass(Message);

export function MessageFactory() {
    const schema = MessageSchema;

    return schema;
}