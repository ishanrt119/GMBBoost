import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoogleSearchRank {
  score: number;
  status: string;
}

export interface IProfileScore {
  score: number;
  reason: string;
}

export interface ISeoScore {
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface IReviewAnalysis {
  score: number;
  reviewFrequency: string;
  responseRate: string;
  sentiment: string;
  strengths: string[];
  weaknesses: string[];
}

export interface IProfileCompletion {
  score: number;
  completedItems: string[];
  missingItems: string[];
}

export interface IKeywordRank {
  keyword: string;
  rank: string;
}

export interface ICompetitor {
  name: string;
  reviewCount: number;
  rating: number;
  category: string;
  distance: string;
  reason: string;
  strengthLevel: string;
}

export interface IAuditData {
  executiveSummary: string;
  overallScore: number;
  googleSearchRank: IGoogleSearchRank;
  profileScore: IProfileScore;
  seoScore: ISeoScore;
  reviewAnalysis: IReviewAnalysis;
  profileCompletion: IProfileCompletion;
  topKeywords: IKeywordRank[];
  competitors: ICompetitor[];
  strengths: string[];
  weaknesses: string[];
  quickWins: string[];
  priorityFixes: string[];
  thirtyDayPlan: string[];
  ninetyDayPlan: string[];
  growthOpportunities: string[];
  businessTier: string;
}

export interface IAudit extends Document {
  tenantId: string;
  userId: string;
  organizationId: string;
  
  businessId: mongoose.Types.ObjectId;
  businessName: string;
  userDefinedCategory?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  
  location: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  overallScore?: number;
  auditData?: IAuditData;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const GoogleSearchRankSchema = new Schema<IGoogleSearchRank>({
  score: { type: Number, default: 0 },
  status: { type: String, default: "" }
});

const ProfileScoreSchema = new Schema<IProfileScore>({
  score: { type: Number, default: 0 },
  reason: { type: String, default: "" }
});

const SeoScoreSchema = new Schema<ISeoScore>({
  score: { type: Number, default: 0 },
  issues: { type: [String], default: [] },
  recommendations: { type: [String], default: [] }
});

const ReviewAnalysisSchema = new Schema<IReviewAnalysis>({
  score: { type: Number, default: 0 },
  reviewFrequency: { type: String, default: "" },
  responseRate: { type: String, default: "" },
  sentiment: { type: String, default: "" },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] }
});

const ProfileCompletionSchema = new Schema<IProfileCompletion>({
  score: { type: Number, default: 0 },
  completedItems: { type: [String], default: [] },
  missingItems: { type: [String], default: [] }
});

const KeywordRankSchema = new Schema<IKeywordRank>({
  keyword: { type: String, default: "" },
  rank: { type: String, default: "" }
});

const CompetitorSchema = new Schema<ICompetitor>({
  name: { type: String, default: "" },
  reviewCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  category: { type: String, default: "" },
  distance: { type: String, default: "" },
  reason: { type: String, default: "" },
  strengthLevel: { type: String, default: "" }
});

const AuditDataSchema = new Schema<IAuditData>({
  executiveSummary: { type: String, default: "" },
  overallScore: { type: Number, default: 0 },
  googleSearchRank: { type: GoogleSearchRankSchema, default: () => ({}) },
  profileScore: { type: ProfileScoreSchema, default: () => ({}) },
  seoScore: { type: SeoScoreSchema, default: () => ({}) },
  reviewAnalysis: { type: ReviewAnalysisSchema, default: () => ({}) },
  profileCompletion: { type: ProfileCompletionSchema, default: () => ({}) },
  topKeywords: { type: [KeywordRankSchema], default: [] },
  competitors: { type: [CompetitorSchema], default: [] },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  quickWins: { type: [String], default: [] },
  priorityFixes: { type: [String], default: [] },
  thirtyDayPlan: { type: [String], default: [] },
  ninetyDayPlan: { type: [String], default: [] },
  growthOpportunities: { type: [String], default: [] },
  businessTier: { type: String, default: "Unknown" }
});

const AuditSchema = new Schema<IAudit>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    organizationId: { type: String, required: true },
    
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', index: true },
    businessName: { type: String, required: true },
    userDefinedCategory: { type: String },
    website: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    overallScore: { type: Number },
    auditData: { type: AuditDataSchema },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditSchema.index({ tenantId: 1, businessName: 1 });

const Audit: Model<IAudit> = mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);

export default Audit;
