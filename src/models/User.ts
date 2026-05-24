import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  verified: boolean;
  verificationToken?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiry?: Date;
  googleConnected: boolean;
  role: string;
  businessIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String }, // optional for OAuth users
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleTokenExpiry: { type: Date },
    googleConnected: { type: Boolean, default: false },
    role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
    businessIds: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
