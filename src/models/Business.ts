import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  category: string;
  userDefinedCategory?: string;
  categories: string[];
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  services?: string;
  offers?: string;
  tone?: string;
  phone?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  googleLocationId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleAccountId?: string;
  googleTokenExpiry?: number;
  googleBusinessProfileUrl?: string;
  reviewLink?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  googleRating?: number;
  googleReviewCount?: number;
  googleLocationId?: string;
  googleAccountId?: string;
  googleConnected: boolean;
  keywords: string[];
  competitors: mongoose.Types.ObjectId[];
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  integrations: {
    whatsappNumber?: string;
  };
  metaBusinessProfileUrl?: string;
  facebookPageUrl?: string;
  instagramUrl?: string;
  whatsappConfig: {
    provider: string;
    businessPhone?: string;
    metaProfileUrl?: string;
    isConnected: boolean;
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
    category: { type: String, required: true }, // Keeping for backwards compatibility/primary
    userDefinedCategory: { type: String },
    categories: [{ type: String }],
    address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    services: { type: String },
    offers: { type: String },
    tone: { type: String, default: 'professional' },
    phone: { type: String },
    website: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    googlePlaceId: { type: String, unique: true, sparse: true },
    googleMapsUrl: { type: String },
    googleLocationId: { type: String, index: true },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleAccountId: { type: String },
    googleTokenExpiry: { type: Number },
    googleBusinessProfileUrl: { type: String },
    reviewLink: { type: String },
    formattedAddress: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    googleRating: { type: Number, default: 0 },
    googleReviewCount: { type: Number, default: 0 },
    googleLocationId: { type: String },
    googleAccountId: { type: String },
    googleConnected: { type: Boolean, default: false },
    keywords: [{ type: String }],
    competitors: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    integrations: {
      whatsappNumber: { type: String }
    },
    metaBusinessProfileUrl: { type: String },
    facebookPageUrl: { type: String },
    instagramUrl: { type: String },
    whatsappConfig: {
      provider: { type: String, default: 'meta' },
      businessPhone: { type: String },
      metaProfileUrl: { type: String },
      isConnected: { type: Boolean, default: false }
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
