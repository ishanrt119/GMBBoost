import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompetitorAnalysis {
  placeId: string;
  name: string;
  distanceKm: number;
  rating: number | null;
  reviewCount: number | null;
  photos: number | null; // "Data Not Available" if null
  website: string | null;
  verified: boolean | null;
  category: string;
  responseRate: number | null;
  posts: number | null;
  strengths: string[];
  weaknesses: string[];
}

export interface IKeywordData {
  keyword: string;
  currentRank: number | null;
  previousRank: number | null;
  change: number | null;
  topCompetitors: string[];
  searchVolume: number | null;
  difficulty: number | null;
}

export interface IReviewTheme {
  theme: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface IReviewData {
  averageRating: number | null;
  totalReviews: number | null;
  reviewsThisMonth: number | null;
  reviewsLast90Days: number | null;
  reviewGrowth: number | null;
  responseRate: number | null;
  unansweredReviews: number | null;
  averageResponseTime: number | null;
  positiveThemes: IReviewTheme[];
  negativeThemes: IReviewTheme[];
  frequentlyMentionedTopics: string[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  serviceMentions: string[];
  staffMentions: string[];
  complaintCategories: string[];
}

export interface IProfileData {
  completionPercent: number;
  fields: {
    businessName: 'Complete' | 'Partial' | 'Missing';
    primaryCategory: 'Complete' | 'Partial' | 'Missing';
    additionalCategories: 'Complete' | 'Partial' | 'Missing';
    address: 'Complete' | 'Partial' | 'Missing';
    phone: 'Complete' | 'Partial' | 'Missing';
    website: 'Complete' | 'Partial' | 'Missing';
    description: 'Complete' | 'Partial' | 'Missing';
    services: 'Complete' | 'Partial' | 'Missing';
    products: 'Complete' | 'Partial' | 'Missing';
    photos: 'Complete' | 'Partial' | 'Missing';
    videos: 'Complete' | 'Partial' | 'Missing';
    attributes: 'Complete' | 'Partial' | 'Missing';
    hours: 'Complete' | 'Partial' | 'Missing';
    serviceArea: 'Complete' | 'Partial' | 'Missing';
    appointmentLink: 'Complete' | 'Partial' | 'Missing';
    messagingEnabled: 'Complete' | 'Partial' | 'Missing';
    qaEnabled: 'Complete' | 'Partial' | 'Missing';
  };
}

export interface IQuickWin {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  expectedImpact: string;
  difficulty: 'High' | 'Medium' | 'Low';
  estimatedTime: string;
  implementationSteps: string[];
  sourceEvidence: string;
}

export interface IAuditHistory extends Document {
  businessId: mongoose.Types.ObjectId | string;
  tenantId: string;
  auditDate: Date;
  auditVersion: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  
  // Section 1: Business Snapshot (Stored for historical point-in-time reference)
  snapshot: {
    name: string;
    category: string;
    address: string;
    phone: string;
    website: string;
    rating: number | null;
    reviewCount: number | null;
    photosCount: number | null;
    verificationStatus: string | null;
    businessAge: number | null;
  };

  // Section 2: Profile Completion
  profileData: IProfileData;

  // Section 3: GBP SEO Analysis
  seoAnalysis: {
    topLocalKeywords: string[];
    keywordCoveragePercent: number | null;
    keywordDensity: number | null;
    missingKeywords: string[];
    highOpportunityKeywords: string[];
  };

  // Section 4: Review Intelligence
  reviewData: IReviewData;

  // Section 5: Real Competitor Discovery Engine
  competitors: ICompetitorAnalysis[];
  competitorLogs: {
    name: string;
    category: string;
    distanceKm: number;
    score: number;
    status: 'ACCEPTED' | 'REJECTED';
    reason?: string;
  }[];
  
  // Section 6: Competitor Gap Analysis
  competitorGapAnalysis: {
    targetMetrics: { rating: number; reviews: number; photos: number };
    competitorAverages: { rating: number; reviews: number; photos: number };
    gaps: string[];
  };

  // Section 6: Google Maps Rank Tracking
  keywordData: IKeywordData[];
  rankTrackingConfigured: boolean;

  // Section 7: Posting Activity
  postingActivity: {
    lastPostDate: Date | null;
    postsLast30Days: number | null;
    postsLast90Days: number | null;
    postFrequency: string | null;
    competitorComparison: 'Below Average' | 'Average' | 'Above Average' | 'Data Not Available';
  };

  // Section 8: Photo Performance
  photoPerformance: {
    photoCount: number | null;
    ownerPhotos: number | null;
    customerPhotos: number | null;
    recentPhotos: number | null;
    photoGrowth: number | null;
    percentileRanking: number | null;
  };

  // Section 9: Local Visibility Opportunities
  opportunities: {
    missingCategories: string[];
    missingServices: string[];
    missingKeywords: string[];
    missingPhotos: string[];
    missingPosts: string[];
    missingReviews: string[];
    missingResponses: string[];
    missingAttributes: string[];
  };

  // Section 10: Quick Wins
  quickWins: IQuickWin[];

  // Section 11: 30-Day Action Plan
  actionPlan: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  };

  // Section 12: Executive Summary
  summary: {
    strengths: string[];
    weaknesses: string[];
    missedOpportunities: string[];
    competitivePosition: string;
    growthPotential: string;
    priorityActions: string[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const AuditHistorySchema = new Schema<IAuditHistory>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    auditDate: { type: Date, default: Date.now },
    auditVersion: { type: String, default: 'V3' },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    
    // Using Schema.Types.Mixed for deep nested objects to avoid strict Mongoose subdocument overhead
    // while still keeping TypeScript enforcement via IAuditHistory interface.
    snapshot: { type: Schema.Types.Mixed },
    profileData: { type: Schema.Types.Mixed },
    seoAnalysis: { type: Schema.Types.Mixed },
    reviewData: { type: Schema.Types.Mixed },
    competitors: [{ type: Schema.Types.Mixed }],
    competitorLogs: [{ type: Schema.Types.Mixed }],
    competitorGapAnalysis: { type: Schema.Types.Mixed },
    keywordData: [{ type: Schema.Types.Mixed }],
    rankTrackingConfigured: { type: Boolean, default: false },
    postingActivity: { type: Schema.Types.Mixed },
    photoPerformance: { type: Schema.Types.Mixed },
    opportunities: { type: Schema.Types.Mixed },
    quickWins: [{ type: Schema.Types.Mixed }],
    actionPlan: { type: Schema.Types.Mixed },
    summary: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditHistorySchema.index({ businessId: 1, auditDate: -1 });

export default mongoose.models.AuditHistory || mongoose.model<IAuditHistory>('AuditHistory', AuditHistorySchema);
