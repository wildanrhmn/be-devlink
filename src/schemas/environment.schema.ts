import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type EnvironmentDocument = HydratedDocument<Environment>;

class EnvVariable {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}

@Schema({ timestamps: true, collection: 'environments' })
export class Environment {
  @Prop({ required: true })
  name: string;

  @Prop([raw({ key: { type: String, required: true }, value: { type: String, required: true } })])
  variables: EnvVariable[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: MongooseSchema.Types.ObjectId;
}

export const EnvironmentSchema = SchemaFactory.createForClass(Environment);