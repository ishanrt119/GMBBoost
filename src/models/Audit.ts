import mongoose, { Schema, Document } from 'mongoose';

export interface IAudit extends Document {
  businessId: mongoose.Types.ObjectId;
  overallScore: number;
  seoScore: number;
  reviewScore: number;
  engagementScore: number;
  completenessScore: number;
  aiSummary: string;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AuditSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    overallScore: { type: Number, required: true },
    seoScore: { type: Number, required: true },
    reviewScore: { type: Number, required: true },
    engagementScore: { type: Number, required: true },
    completenessScore: { type: Number, required: true },
    aiSummary: { type: String },
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);
