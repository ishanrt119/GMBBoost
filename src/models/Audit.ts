import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecommendation {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface ICompetitor {
  name: string;
  score: number;
  reviews: number;
  rating: number;
  postsPerMonth: number;
}

export interface IAuditData {
  completenessScore: number;
  keywordScore: number;
  sentimentScore: number;
  engagementScore: number;
  quickWins: string[];
  strengths: string[];
  weaknesses: string[];
  seoInsights: string;
  reviewInsights: string;
  contentInsights: string;
  growthOpportunities: string;
}

export interface IAudit extends Document {
  tenantId: string;
  userId: string;
  organizationId: string;
  businessName: string;
  location: string;
  gbpUrl?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  overallScore?: number;
  auditData?: IAuditData;
  recommendations?: IRecommendation[];
  competitors?: ICompetitor[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>({
  title: { type: String, required: true },
  impact: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  effort: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  description: { type: String, required: true },
});

const CompetitorSchema = new Schema<ICompetitor>({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  reviews: { type: Number, required: true },
  rating: { type: Number, required: true },
  postsPerMonth: { type: Number, required: true },
});

const AuditDataSchema = new Schema<IAuditData>({
  completenessScore: { type: Number, required: true },
  keywordScore: { type: Number, required: true },
  sentimentScore: { type: Number, required: true },
  engagementScore: { type: Number, required: true },
  quickWins: { type: [String], required: true },
  strengths: { type: [String], required: true },
  weaknesses: { type: [String], required: true },
  seoInsights: { type: String, required: true },
  reviewInsights: { type: String, required: true },
  contentInsights: { type: String, required: true },
  growthOpportunities: { type: String, required: true },
});

const AuditSchema = new Schema<IAudit>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    organizationId: { type: String, required: true },
    businessName: { type: String, required: true },
    location: { type: String, required: true },
    gbpUrl: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    overallScore: { type: Number },
    auditData: { type: AuditDataSchema },
    recommendations: { type: [RecommendationSchema] },
    competitors: { type: [CompetitorSchema] },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditSchema.index({ tenantId: 1, businessName: 1 });

const Audit: Model<IAudit> = mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);

export default Audit;
