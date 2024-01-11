import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { Document } from 'mongoose';

export class MessageLocation {
  lat: number;
  lng: number;
  desc: string;
}

export class MessageContact {
  name: string;
  phones: { number: string; label: string }[];
  email: { address: string; label: string }[];
  address: { address: string; label: string }[];
  org: { name: string; label: string }[];
  relationship: string[];
  note: string;
}

export class MessageFile {
  constructor(data: MessageFile) {
    Object.assign(this, data);
  }
  mime: string;
  name: string;
  originName?: string;
  size: number;
}

@Schema()
export class Message extends Document {
  static fromPlain(data) {
    return plainToClass(Message, data);
  }

  @Prop({
    required: true,
    index: true,
    unique: false,
  })
  receiver: string;

  @Prop({
    required: true,
    index: true,
    unique: false,
  })
  sender: string;

  @Prop()
  @MaxLength(200)
  text: string;

  // 0: published or stored, 1: retrieved
  @Prop()
  state: number;

  @Prop({
    type: MessageLocation,
  })
  loc: MessageLocation;

  @Prop()
  files: MessageFile[];

  @Prop({
    type: MessageContact,
  })
  contact: MessageContact;
}

export class Messages {
  constructor() {
    this.data = [];
    this.page = 1;
    this.pageSize = 10;
    this.pageTotal = 0;
  }
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

export class LinkedMessage extends Document {}

export const MessageSchema = SchemaFactory.createForClass(Message);

export function MessageFactory() {
  const schema = MessageSchema;

  return schema;
}
