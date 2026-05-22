import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  businessId: mongoose.Types.ObjectId;
  content: string;
  media: string[];
  scheduledDate: Date;
  status: string;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    scheduledDate: { type: Date },
    status: { type: String, enum: ['draft', 'scheduled', 'published', 'failed'], default: 'draft', index: true },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
