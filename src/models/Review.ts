import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  businessId: mongoose.Types.ObjectId;
  requestId?: mongoose.Types.ObjectId;
  reviewer: string;
  rating: number;
  reviewText: string;
  sentiment: string;
  response: string;
  aiSuggestedReply?: string;
  replyStatus?: 'PENDING' | 'POSTED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'ReviewRequest', index: true, unique: true, sparse: true },
    reviewer: { type: String, required: true },
    rating: { type: Number, required: true },
    reviewText: { type: String },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    response: { type: String },
    aiSuggestedReply: { type: String },
    replyStatus: { type: String, enum: ['PENDING', 'POSTED', 'FAILED'], default: 'PENDING' },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
