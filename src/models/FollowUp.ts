import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  leadId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  completed: boolean;
  reminderType: string;
}

const FollowUpSchema: Schema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    scheduledAt: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    reminderType: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
