import { GMBBusinessData } from '../gmb/provider';

export function analyzeReviews(data: GMBBusinessData) {
  // Layer 3: Review Intelligence Layer
  // Strict quantitative extraction. No generated insights.
  const reviews = data.reviews || [];
  const averageRating = data.rating;
  const totalReviews = data.reviewsCount;
  
  const now = new Date();
  let reviewsThisMonth = 0;
  let reviewsLast90Days = 0;
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  for (const r of reviews) {
    if (!r.date) continue;
    const rDate = new Date(r.date);
    const diffDays = (now.getTime() - rDate.getTime()) / (1000 * 3600 * 24);
    
    if (diffDays <= 30) reviewsThisMonth++;
    if (diffDays <= 90) reviewsLast90Days++;

    if (r.rating >= 4) positiveCount++;
    else if (r.rating === 3) neutralCount++;
    else negativeCount++;
  }

  return {
    averageRating,
    totalReviews,
    reviewsThisMonth: reviews.length > 0 ? reviewsThisMonth : null,
    reviewsLast90Days: reviews.length > 0 ? reviewsLast90Days : null,
    reviewGrowth: null,
    responseRate: null,
    unansweredReviews: null,
    averageResponseTime: null,
    positiveThemes: [], 
    negativeThemes: [], 
    frequentlyMentionedTopics: [],
    sentimentBreakdown: {
      positive: positiveCount,
      neutral: neutralCount,
      negative: negativeCount
    },
    serviceMentions: [],
    staffMentions: [],
    complaintCategories: []
  };
}
