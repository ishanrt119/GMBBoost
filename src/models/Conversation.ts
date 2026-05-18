import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  leadId: mongoose.Types.ObjectId;
  sender: 'user' | 'ai' | 'system';
  message: string;
  aiGenerated: boolean;
  timestamp: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    sender: { type: String, enum: ['user', 'ai', 'system'], required: true },
    message: { type: String, required: true },
    aiGenerated: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
