import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewRequest extends Document {
  customerId: mongoose.Types.ObjectId;
  messageStatus: string;
  reminderCount: number;
  clicked: boolean;
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewRequestSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    messageStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    reminderCount: { type: Number, default: 0 },
    clicked: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.ReviewRequest || mongoose.model<IReviewRequest>('ReviewRequest', ReviewRequestSchema);
