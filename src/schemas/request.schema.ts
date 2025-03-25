import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type RequestDocument = HydratedDocument<Request>;

// Nested schemas
class Header {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}

class Param {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}

@Schema({ timestamps: true, collection: 'requests' })
export class Request {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  url: string;

  @Prop([raw({ key: { type: String, required: true }, value: { type: String, required: true } })])
  headers: Header[];

  @Prop([raw({ key: { type: String, required: true }, value: { type: String, required: true } })])
  params: Param[];

  @Prop()
  body: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Response' }] })
  responses: MongooseSchema.Types.ObjectId[];

  @Prop()
  notes: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);