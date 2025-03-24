import { Schema, model, Document } from 'mongoose';

const EnvVariableSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
});

export interface IEnvironment extends Document {
  name: string;
  variables: { key: string; value: string; }[];
  owner: Schema.Types.ObjectId;
}

export const EnvironmentSchema = new Schema<IEnvironment>({
  name: { type: String, required: true },
  variables: [EnvVariableSchema],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
  collection: 'environments'
});

export const Environment = model<IEnvironment>('Environment', EnvironmentSchema);
