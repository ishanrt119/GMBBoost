import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  tenantId: string;
  organizationId?: string;
  businessId: mongoose.Types.ObjectId;
  assignedUserId?: mongoose.Types.ObjectId;
  
  name: string;
  email?: string;
  phone?: string;
  source: 'WhatsApp' | 'Website' | 'Manual' | 'Instagram' | 'Facebook' | 'Referral';
  status: 'active' | 'inactive';
  pipelineStage: 'New' | 'Contacted' | 'Qualified' | 'Interested' | 'Not Interested' | 'Converted';
  tags: string[];
  notes?: string;
  
  followUpDates: Date[];
  
  aiLeadScore?: number;
  aiInsights?: string;
  
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    organizationId: { type: String, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    source: { 
      type: String, 
      enum: ['WhatsApp', 'Website', 'Manual', 'Instagram', 'Facebook', 'Referral'],
      default: 'Manual'
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    pipelineStage: { 
      type: String, 
      enum: ['New', 'Contacted', 'Qualified', 'Interested', 'Not Interested', 'Converted'],
      default: 'New'
    },
    tags: [{ type: String }],
    notes: { type: String },
    
    followUpDates: [{ type: Date }],
    
    aiLeadScore: { type: Number, min: 0, max: 100 },
    aiInsights: { type: String },
    
    lastActivityAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
