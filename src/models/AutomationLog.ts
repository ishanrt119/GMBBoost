import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomationLog extends Document {
  action?: string;
  status?: string;
  message?: string;
  prompt?: string;
  response?: string;
  aiModel?: string;
  tokens?: number;
  type: 'scheduler' | 'ai_generation' | 'n8n_webhook' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

const AutomationLogSchema: Schema = new Schema(
  {
    action: { type: String },
    status: { type: String },
    message: { type: String },
    prompt: { type: String },
    response: { type: String },
    aiModel: { type: String },
    tokens: { type: Number },
    type: { type: String, enum: ['scheduler', 'ai_generation', 'n8n_webhook', 'other'], required: true, default: 'other' },
  },
  { timestamps: true }
);

export default mongoose.models.AutomationLog || mongoose.model<IAutomationLog>('AutomationLog', AutomationLogSchema);
