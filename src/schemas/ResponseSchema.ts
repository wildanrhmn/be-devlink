import { Schema, model, Document } from 'mongoose';

const HeaderSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
});

export interface IResponse extends Document {
  statusCode: number;
  body: string;
  headers: { key: string; value: string; }[];
  timestamp: Date;
  request: Schema.Types.ObjectId;
}

export const ResponseSchema = new Schema<IResponse>({
  statusCode: { type: Number, required: true },
  body: { type: String, required: true },
  headers: [HeaderSchema],
  timestamp: { type: Date, required: true, default: Date.now },
  request: { type: Schema.Types.ObjectId, ref: 'Request', required: true }
}, {
  timestamps: true,
  collection: 'responses'
});

export const Response = model<IResponse>('Response', ResponseSchema);
