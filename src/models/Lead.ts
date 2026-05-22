import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  phone: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Interested' | 'Booking Pending' | 'Converted' | 'Lost';
  
  businessType?: string;
  budget?: string;
  urgency?: 'Low' | 'Medium' | 'High' | 'Urgent';
  requirements?: string;
  intentScore: number;
  qualificationStatus: 'Unqualified' | 'Partially Qualified' | 'Qualified' | 'Sales Ready';
  aiSummary?: string;
  
  bookingInterested?: boolean;
  nextFollowUpDate?: Date;
  conversionProbability?: number;
  aiTags?: string[];
  conversationStage?: string;

  interest?: string;
  notes?: string;
  
  lastUserMessage?: string;
  lastAIReply?: string;
  retryCount: number;
  lastInteractionTime?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    source: { type: String, default: 'WhatsApp' },
    status: { 
      type: String, 
      enum: ['New', 'Contacted', 'Qualified', 'Interested', 'Booking Pending', 'Converted', 'Lost'], 
      default: 'New', 
      index: true 
    },
    
    businessType: { type: String },
    budget: { type: String },
    urgency: { 
      type: String, 
      enum: ['Low', 'Medium', 'High', 'Urgent']
    },
    requirements: { type: String },
    intentScore: { type: Number, default: 0 },
    qualificationStatus: { 
      type: String, 
      enum: ['Unqualified', 'Partially Qualified', 'Qualified', 'Sales Ready'],
      default: 'Unqualified'
    },
    aiSummary: { type: String },

    bookingInterested: { type: Boolean, default: false },
    nextFollowUpDate: { type: Date },
    conversionProbability: { type: Number, default: 0 },
    aiTags: [{ type: String }],
    conversationStage: { type: String },

    interest: { type: String },
    notes: { type: String },
    
    lastUserMessage: { type: String },
    lastAIReply: { type: String },
    retryCount: { type: Number, default: 0 },
    lastInteractionTime: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
