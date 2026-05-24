import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  businessId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  service?: string;
  visitDate?: Date;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  source: 'CSV' | 'MANUAL' | 'CRM_HUBSPOT' | 'CRM_SALESFORCE' | 'CRM_ZOHO';
  isDuplicate: boolean;
  reviewStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', index: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: { type: String },
    email: { type: String },
    service: { type: String },
    visitDate: { type: Date },
    channel: { type: String, enum: ['WHATSAPP', 'EMAIL', 'SMS'], default: 'WHATSAPP' },
    source: { type: String, enum: ['CSV', 'MANUAL', 'CRM_HUBSPOT', 'CRM_SALESFORCE', 'CRM_ZOHO'], default: 'MANUAL' },
    isDuplicate: { type: Boolean, default: false },
    reviewStatus: { type: String, enum: ['none', 'requested', 'reviewed'], default: 'none' },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
