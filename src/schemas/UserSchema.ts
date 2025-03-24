import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  collections?: Schema.Types.ObjectId[];
}

export const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  collections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }]
}, {
  timestamps: true,
  collection: 'users'
});

export const User = model<IUser>('User', UserSchema);
