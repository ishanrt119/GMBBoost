import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKeywordRank {
  keyword: string;
  rank: number;
  sourceQuery?: string;
  confidence?: string;
}

export interface IGoogleSearchRank {
  averageRank: number;
  topKeywords: IKeywordRank[];
}

export interface IPotentialScoreAnalysis {
  potentialScore: number;
  recoverablePoints: number;
  breakdown: string[];
}

export interface IProfileScore {
  overallScore: number;
  completionScore: number;
  seoScore: number;
  engagementScore: number;
  potentialScoreAnalysis?: IPotentialScoreAnalysis;
  
  // Legacy compat
  reviewScore?: number;
  profileCompletionScore?: number;
  ratingScore?: number;
  contentScore?: number;
}

export interface ISeoScore {
  score: number;
  missingKeywords: string[];
  optimizationOpportunities: string[];
}

export interface IReviewAnalysis {
  reviewCount: number;
  averageRating: number;
  reviewsPerWeek: number;
  industryAverage: number;
  responseRate: string;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
  mostCommonPraises: string[];
  mostCommonComplaints: string[];
}

export interface IChecklistItem {
  field: string;
  status: 'Complete' | 'Partial' | 'Missing';
}

export interface IProfileCompletion {
  completionPercentage: number;
  checklist: IChecklistItem[];
}

export interface IKeywordGap {
  keyword: string;
  found: boolean;
  missing: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface IGapScoreBreakdown {
  reviews: number;
  rating: number;
  category: number;
  profile: number;
  total: number;
}

export interface ICompetitorGap {
  missingAdvantages: string[];
  gapScore: number;
  gapScoreBreakdown?: IGapScoreBreakdown;
}

export interface ICompetitor {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  estimatedRank: number;
  distance: string;
  reason: string;
  website?: string;
  categoryMatchScore?: number;
  similarityScore?: number;
  strengthScore?: number;
  strength?: string;
  gapAnalysis?: ICompetitorGap;
}

export interface IStructuredEvidence {
  metric: string;
  currentValue: number | string;
  competitorAverage?: number | string;
  source: string;
}

export interface IPriorityFix {
  title: string;
  reason: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  expectedScoreGain: number | string;
  revenuePotential?: 'High' | 'Medium' | 'Low'; // legacy compat
  evidence?: IStructuredEvidence;
}

export interface IStrengthWeakness {
  title: string;
  observation?: string;
  evidence: IStructuredEvidence | string; // legacy support for string
  impact?: string;
  risk?: string;
}

export interface IThirtyDayPlan {
  week: string;
  objective?: string;
  tasks: string[];
  expectedOutcome?: string;
  expectedScoreGain?: number | string;
}

export interface INinetyDayPlan {
  month: string;
  objective?: string;
  tasks: string[];
  focusAreas?: string[];
  expectedScoreGain?: number | string;
}

export interface IDataQuality {
  profileData: 'Complete' | 'Partial' | 'Unavailable';
  competitorDiscovery: 'Complete' | 'Partial' | 'Unavailable';
  keywordDiscovery: 'Complete' | 'Partial' | 'Unavailable';
  reviewAnalysis: 'Complete' | 'Partial' | 'Unavailable';
  websiteAnalysis: 'Complete' | 'Partial' | 'Unavailable';
}

export interface IConfidenceBreakdown {
  profileData: string;
  competitors: string;
  keywords: string;
  reviews: string;
  websiteAnalysis: string;
}

export interface IAuditConfidence {
  dataQuality: IDataQuality;
  confidenceScore: number; // e.g. 85 for 85%
  confidenceBreakdown?: IConfidenceBreakdown;
  confidenceCalculationVersion?: string;
}

export interface IBusinessIntelligence {
  competitivePosition: string;
  marketSaturation: string;
  reviewGap: number;
  visibilityGap: string;
  growthPotential: string;
}

export interface IAuditData {
  googleSearchRank: IGoogleSearchRank;
  profileScore: IProfileScore;
  competitors: ICompetitor[];
  keywordGapAnalysis: IKeywordGap[];
  seoScore: ISeoScore;
  reviewAnalysis: IReviewAnalysis;
  profileCompletion: IProfileCompletion;
  
  strengths: IStrengthWeakness[];
  weaknesses: IStrengthWeakness[];
  quickWins: string[];
  priorityFixes: IPriorityFix[];
  thirtyDayPlan: IThirtyDayPlan[];
  ninetyDayPlan: INinetyDayPlan[];
  
  businessTier: string;
  evidence?: Record<string, string>;
  
  auditConfidence?: IAuditConfidence;
  businessIntelligence?: IBusinessIntelligence;
}

export interface IAuditSnapshot {
  reviewCount: number;
  averageRating: number;
  profileScore: number;
  seoScore: number;
  rankScore: number;
  competitorCount: number;
  generatedAt: string;
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
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PARTIAL' | 'INSUFFICIENT_DATA';
  auditVersion: 'V5' | 'V6' | 'V7' | 'V7.1' | 'V7.2' | 'V8';
  overallScore?: number;
  auditData?: IAuditData;
  metadata?: {
    auditSnapshot?: IAuditSnapshot;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

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
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'PARTIAL', 'INSUFFICIENT_DATA'],
      default: 'PENDING',
    },
    auditVersion: { type: String, enum: ['V5', 'V6', 'V7', 'V7.1', 'V7.2', 'V8'], default: 'V7.2' },
    overallScore: { type: Number },
    auditData: { type: Schema.Types.Mixed }, // Using Mixed for the root data object since it's large and varies heavily
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditSchema.index({ tenantId: 1, businessName: 1 });

if (mongoose.models.Audit) {
  delete mongoose.models.Audit;
}

const Audit: Model<IAudit> = mongoose.model<IAudit>('Audit', AuditSchema);

export default Audit;
