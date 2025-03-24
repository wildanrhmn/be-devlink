import { Schema, model, Document } from 'mongoose';

const HeaderSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
});

const ParamSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
});

export interface IRequest extends Document {
  name: string;
  method: string;
  url: string;
  headers: { key: string; value: string; }[];
  params: { key: string; value: string; }[];
  body?: string;
  responses: Schema.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RequestSchema = new Schema<IRequest>({
  name: { type: String, required: true },
  method: { type: String, required: true },
  url: { type: String, required: true },
  headers: [HeaderSchema],
  params: [ParamSchema],
  body: { type: String },
  responses: [{ type: Schema.Types.ObjectId, ref: 'Response' }],
  notes: { type: String }
}, {
  timestamps: true,
  collection: 'requests'
});

export const Request = model<IRequest>('Request', RequestSchema);
