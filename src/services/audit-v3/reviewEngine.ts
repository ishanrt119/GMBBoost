import { GMBBusinessData } from '../gmb/provider';
import { IReviewData } from '../../models/AuditHistory';

export function analyzeReviews(data: GMBBusinessData): IReviewData {
  const reviews = data.reviews || [];
  
  // Calculate average rating
  const averageRating = data.rating;
  const totalReviews = data.reviewsCount;
  
  // In a real OAuth implementation, we would check dates.
  // We'll mock the date-based metrics as "Data Not Available" (null) for now unless we have real review objects.
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

  // To prevent fake data, we return exact metrics from the dataset
  // AI analysis would normally process review texts here via an LLM.
  // For the V3 foundation, we will return empty arrays if we cannot reliably perform semantic analysis yet.
  
  return {
    averageRating,
    totalReviews,
    reviewsThisMonth: reviews.length > 0 ? reviewsThisMonth : null,
    reviewsLast90Days: reviews.length > 0 ? reviewsLast90Days : null,
    reviewGrowth: null, // Need historical data to compute growth
    responseRate: null, // GBP API required to see owner responses
    unansweredReviews: null, // GBP API required
    averageResponseTime: null, // GBP API required
    positiveThemes: [], // Awaiting LLM integration
    negativeThemes: [], // Awaiting LLM integration
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
