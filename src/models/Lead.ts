import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  phone: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Interested' | 'Converted' | 'Lost';
  interest?: string;
  notes?: string;
  tags?: string[];
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
      enum: ['New', 'Contacted', 'Qualified', 'Interested', 'Converted', 'Lost'], 
      default: 'New', 
      index: true 
    },
    interest: { type: String },
    notes: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
