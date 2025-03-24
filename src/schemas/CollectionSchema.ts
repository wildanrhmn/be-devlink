import { Schema, model, Document } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  requests: Schema.Types.ObjectId[];
  owner: Schema.Types.ObjectId;
  sharedWith: Schema.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CollectionSchema = new Schema<ICollection>({
  name: { type: String, required: true },
  description: { type: String },
  requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, required: true, default: false }
}, {
  timestamps: true,
  collection: 'collections'
});

export const Collection = model<ICollection>('Collection', CollectionSchema);
