import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewRequest extends Document {
  campaignId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  status: 'QUEUED' | 'SENT' | 'CLICKED' | 'REVIEWED' | 'FAILED' | 'UNSUBSCRIBED';
  sentAt?: Date;
  clickedAt?: Date;
  reviewedAt?: Date;
  failedAt?: Date;
  failReason?: string;
  reminder1SentAt?: Date;
  reminder2SentAt?: Date;
  
  // Legacy fields preserved for compatibility
  messageStatus?: string;
  reminderCount?: number;
  clicked?: boolean;
  reviewed?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const ReviewRequestSchema: Schema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    channel: { type: String, enum: ['WHATSAPP', 'EMAIL', 'SMS'], default: 'WHATSAPP' },
    status: { 
      type: String, 
      enum: ['QUEUED', 'SENT', 'CLICKED', 'REVIEWED', 'FAILED', 'UNSUBSCRIBED'], 
      default: 'QUEUED',
      index: true
    },
    sentAt: { type: Date },
    clickedAt: { type: Date },
    reviewedAt: { type: Date },
    failedAt: { type: Date },
    failReason: { type: String },
    reminder1SentAt: { type: Date },
    reminder2SentAt: { type: Date },

    // Legacy fields
    messageStatus: { type: String },
    reminderCount: { type: Number, default: 0 },
    clicked: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.ReviewRequest || mongoose.model<IReviewRequest>('ReviewRequest', ReviewRequestSchema);
