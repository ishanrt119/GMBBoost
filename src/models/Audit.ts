import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation {
  title: string;
  description: string;
  priority: string;
  impact: string;
  difficulty: string;
}

export interface IAudit extends Document {
  businessId: mongoose.Types.ObjectId;
  overallScore: number;
  seoScore: number;
  reviewScore: number;
  engagementScore: number;
  completenessScore: number;
  aiSummary: string;
  recommendations: IRecommendation[];
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>({
  title: String,
  description: String,
  priority: String,
  impact: String,
  difficulty: String
});

const AuditSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    overallScore: { type: Number, required: true },
    seoScore: { type: Number, required: true },
    reviewScore: { type: Number, required: true },
    engagementScore: { type: Number, required: true },
    completenessScore: { type: Number, required: true },
    aiSummary: { type: String },
    recommendations: [RecommendationSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);
