import { IProfileData, IReviewData, ICompetitorAnalysis } from '../../models/AuditHistory';
import { GMBBusinessData } from '../gmb/provider';

// Layer 6: AI Insight Layer
// This layer ingests verified data and explains it.

export function generateInsights(profile: IProfileData, reviews: IReviewData, data: GMBBusinessData, gapAnalysis: any) {
  const opportunities = {
    missingCategories: profile.fields.additionalCategories !== 'Complete' ? ['Add secondary categories to capture broader search intent.'] : [],
    missingServices: profile.fields.services !== 'Complete' ? ['Add detailed services to your GBP.'] : [],
    missingKeywords: [], 
    missingPhotos: gapAnalysis.targetMetrics.photos < 10 ? [`Upload more photos. You currently have ${gapAnalysis.targetMetrics.photos}, aim for 15+.`] : [],
    missingPosts: profile.fields.description !== 'Complete' ? ['Start utilizing Google Posts weekly.'] : [],
    missingReviews: gapAnalysis.targetMetrics.reviews < gapAnalysis.competitorAverages.reviews ? 
      [`You are trailing behind the top competitors by ${gapAnalysis.competitorAverages.reviews - gapAnalysis.targetMetrics.reviews} reviews.`] : [],
    missingResponses: [], 
    missingAttributes: profile.fields.attributes !== 'Complete' ? ['Add attributes (e.g. wheelchair accessible, amenities).'] : []
  };

  const quickWins = [];
  if (opportunities.missingCategories.length > 0) {
    quickWins.push({
      title: 'Add Secondary Categories',
      priority: 'High',
      expectedImpact: 'Broadens search visibility for related queries.',
      difficulty: 'Low',
      estimatedTime: '10 minutes',
      implementationSteps: ['Log into GBP Manager', 'Go to Edit Profile > Business Information', 'Add related categories'],
      sourceEvidence: opportunities.missingCategories[0]
    });
  }
  if (opportunities.missingReviews.length > 0) {
    quickWins.push({
      title: 'Launch Review Request Campaign',
      priority: 'High',
      expectedImpact: 'Improves map pack ranking and customer trust.',
      difficulty: 'Medium',
      estimatedTime: '1 hour setup',
      implementationSteps: ['Set up automated SMS/Email templates', 'Send review links to past 50 customers'],
      sourceEvidence: opportunities.missingReviews[0]
    });
  }

  const actionPlan = {
    week1: quickWins.filter(q => q.priority === 'High').map(q => q.title),
    week2: quickWins.filter(q => q.priority === 'Medium').map(q => q.title),
    week3: quickWins.filter(q => q.priority === 'Low').map(q => q.title),
    week4: ['Review metrics and ranking changes', 'Respond to any new reviews']
  };

  const summary = {
    strengths: gapAnalysis.gaps.length === 1 && gapAnalysis.gaps[0].includes('outperforming') ? ['Leading the local market in primary metrics.'] : [],
    weaknesses: gapAnalysis.gaps,
    missedOpportunities: quickWins.map(qw => qw.title),
    competitivePosition: gapAnalysis.targetMetrics.reviews >= gapAnalysis.competitorAverages.reviews ? 'Leading' : 'Lagging',
    growthPotential: 'High',
    priorityActions: actionPlan.week1
  };

  return { opportunities, quickWins, actionPlan, summary };
}
