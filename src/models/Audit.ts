import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecommendation {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface ICompetitor {
  name: string;
  score: number;      // avg rank position (lower = better)
  reviews: number;
  rating: number;
  postsPerMonth: number;
  placeId?: string;
  address?: string;
}

export interface IKeywordRanking {
  keyword: string;
  rank: number;       // actual SERP local-pack position (1-20+)
  source: 'serpapi' | 'estimated';
}

export interface IAuditData {
  executiveSummary: string;
  businessHealthScore: number;
  seoScore: number;
  profileScore: number;
  reviewScore: number;
  searchVisibilityScore: number;
  competitorAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  keywordOpportunities: string[];
  reviewOpportunities: string[];
  growthOpportunities: string[];
  actionPlan30Day: string[];
  roadmap90Day: string[];
  priorityRecommendations: string[];
}

/** Real business metrics fetched from APIs — stored separately from AI-generated auditData */
export interface IRealMetrics {
  businessRating: number;       // from Google Places
  reviewsCount: number;         // total review count
  servicesCount: number;        // number of services on profile
  categoriesCount: number;      // number of categories
  reviewsPerWeek: number;       // calculated from review dates
  responseRate: number;         // % of reviews with owner reply (0-100)
  hasWebsite: boolean;
  hasPhone: boolean;
  hasDescription: boolean;
  hasHours: boolean;
  hasPhotos: boolean;
  hasLogo: boolean;
  hasServiceArea: boolean;
  hasAppointmentLinks: boolean;
  hasAdditionalCategories: boolean;
  keywordRankings: IKeywordRanking[];
  calculatedProfileScore: number;
  calculatedEngagementScore: number;
}

export interface IAudit extends Document {
  tenantId: string;
  userId: string;
  organizationId: string;
  
  // Phase 4: Direct Business Mapping
  businessId: mongoose.Types.ObjectId;
  businessName: string;
  userDefinedCategory?: string;
  googlePlaceId?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleBusinessProfile?: string;
  
  location: string;
  gbpUrl?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  overallScore?: number;
  auditData?: IAuditData;
  realMetrics?: IRealMetrics;
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
  reviews: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  postsPerMonth: { type: Number, default: 0 },
  placeId: { type: String },
  address: { type: String },
});

const KeywordRankingSchema = new Schema<IKeywordRanking>({
  keyword: { type: String, required: true },
  rank: { type: Number, required: true },
  source: { type: String, enum: ['serpapi', 'estimated'], required: true },
});

const AuditDataSchema = new Schema<IAuditData>({
  executiveSummary: { type: String, required: true },
  businessHealthScore: { type: Number, required: true },
  seoScore: { type: Number, required: true },
  profileScore: { type: Number, required: true },
  reviewScore: { type: Number, required: true },
  searchVisibilityScore: { type: Number, required: true },
  competitorAnalysis: { type: String, required: true },
  strengths: { type: [String], required: true },
  weaknesses: { type: [String], required: true },
  keywordOpportunities: { type: [String], required: true },
  reviewOpportunities: { type: [String], required: true },
  growthOpportunities: { type: [String], required: true },
  actionPlan30Day: { type: [String], required: true },
  roadmap90Day: { type: [String], required: true },
  priorityRecommendations: { type: [String], required: true },
});

const RealMetricsSchema = new Schema<IRealMetrics>({
  businessRating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  servicesCount: { type: Number, default: 0 },
  categoriesCount: { type: Number, default: 0 },
  reviewsPerWeek: { type: Number, default: 0 },
  responseRate: { type: Number, default: 0 },
  hasWebsite: { type: Boolean, default: false },
  hasPhone: { type: Boolean, default: false },
  hasDescription: { type: Boolean, default: false },
  hasHours: { type: Boolean, default: false },
  hasPhotos: { type: Boolean, default: false },
  hasLogo: { type: Boolean, default: false },
  hasServiceArea: { type: Boolean, default: false },
  hasAppointmentLinks: { type: Boolean, default: false },
  hasAdditionalCategories: { type: Boolean, default: false },
  keywordRankings: { type: [KeywordRankingSchema], default: [] },
  calculatedProfileScore: { type: Number, default: 0 },
  calculatedEngagementScore: { type: Number, default: 0 },
});

const AuditSchema = new Schema<IAudit>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    organizationId: { type: String, required: true },
    
    // Business Mapping
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', index: true },
    businessName: { type: String, required: true },
    userDefinedCategory: { type: String },
    googlePlaceId: { type: String },
    website: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    googleBusinessProfile: { type: String },
    
    location: { type: String, required: true },
    gbpUrl: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    overallScore: { type: Number },
    auditData: { type: AuditDataSchema },
    realMetrics: { type: RealMetricsSchema },
    recommendations: { type: [RecommendationSchema] },
    competitors: { type: [CompetitorSchema] },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditSchema.index({ tenantId: 1, businessName: 1 });

const Audit: Model<IAudit> = mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);

export default Audit;
