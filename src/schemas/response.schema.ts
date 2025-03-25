import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ResponseDocument = HydratedDocument<Response>;

class Header {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}

@Schema({ timestamps: true, collection: 'responses' })
export class Response {
  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  body: string;

  @Prop([raw({ key: { type: String, required: true }, value: { type: String, required: true } })])
  headers: Header[];

  @Prop({ type: Date, required: true, default: Date.now })
  timestamp: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Request', required: true })
  request: MongooseSchema.Types.ObjectId;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);