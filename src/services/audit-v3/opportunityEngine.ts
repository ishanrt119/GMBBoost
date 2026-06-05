import { IProfileData, IReviewData } from '../../models/AuditHistory';
import { GMBBusinessData } from '../gmb/provider';

export function analyzeOpportunities(profile: IProfileData, reviews: IReviewData, data: GMBBusinessData) {
  const missingCategories = [];
  if (profile.fields.additionalCategories !== 'Complete') {
    missingCategories.push('Add secondary categories to capture broader search intent.');
  }

  const missingPhotos = [];
  if (profile.fields.photos !== 'Complete') {
    missingPhotos.push(`Upload more photos. You currently have ${data.photosCount || 0}, but top competitors average 15+.`);
  }

  const missingReviews = [];
  if ((reviews.totalReviews || 0) < 50) {
    missingReviews.push(`You only have ${reviews.totalReviews || 0} reviews. Aim for 50+ to establish strong local authority.`);
  }

  return {
    missingCategories,
    missingServices: profile.fields.services !== 'Complete' ? ['Add detailed services to your GBP.'] : [],
    missingKeywords: [], // Extracted from SEO engine later
    missingPhotos,
    missingPosts: profile.fields.description !== 'Complete' ? ['Start utilizing Google Posts weekly.'] : [],
    missingReviews,
    missingResponses: [], // Requires GBP API
    missingAttributes: profile.fields.attributes !== 'Complete' ? ['Add attributes (e.g. wheelchair accessible, amenities).'] : []
  };
}

export function generateQuickWins(opportunities: any) {
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

  if (opportunities.missingPhotos.length > 0) {
    quickWins.push({
      title: 'Upload Exterior/Interior Photos',
      priority: 'Medium',
      expectedImpact: 'Increases listing engagement and conversion rate.',
      difficulty: 'Low',
      estimatedTime: '30 minutes',
      implementationSteps: ['Take high-quality photos of your storefront', 'Upload to GBP Photos section'],
      sourceEvidence: opportunities.missingPhotos[0]
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

  return quickWins;
}
