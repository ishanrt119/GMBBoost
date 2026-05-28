import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  category: string;
  address: string;
  city?: string;
  services?: string;
  offers?: string;
  tone?: string;
  phone?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  placeId?: string;
  googleLocationId?: string;
  googleAccountId?: string;
  googleConnected: boolean;
  keywords: string[];
  competitors: mongoose.Types.ObjectId[];
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  integrations: {
    twilioSid?: string;
    twilioAuthToken?: string;
    whatsappNumber?: string;
  };
  aiSettings: {
    tone: string;
    salesPrompt?: string;
    replyStyle?: string;
    leadQualificationBehavior?: string;
  };
  reviewAutomationSettings: {
    enabled: boolean;
    reminderDays: number;
    messageTemplate?: string;
  };
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    services: { type: String },
    offers: { type: String },
    tone: { type: String, default: 'professional' },
    phone: { type: String },
    website: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    placeId: { type: String, unique: true, sparse: true },
    googleLocationId: { type: String },
    googleAccountId: { type: String },
    googleConnected: { type: Boolean, default: false },
    keywords: [{ type: String }],
    competitors: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    integrations: {
      twilioSid: { type: String },
      twilioAuthToken: { type: String },
      whatsappNumber: { type: String }
    },
    aiSettings: {
      tone: { type: String, default: 'professional' },
      salesPrompt: { type: String },
      replyStyle: { type: String },
      leadQualificationBehavior: { type: String }
    },
    reviewAutomationSettings: {
      enabled: { type: Boolean, default: false },
      reminderDays: { type: Number, default: 3 },
      messageTemplate: { type: String }
    },
    onboardingCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);
