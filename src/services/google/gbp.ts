import { getOAuth2Client } from './auth';
import Business from '@/models/Business';

export async function getBusinessOAuthClient(business: any) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: business.googleAccessToken,
    refresh_token: business.googleRefreshToken,
    expiry_date: business.googleTokenExpiry
  });

  // Automatically save new tokens if they are refreshed
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      business.googleRefreshToken = tokens.refresh_token;
    }
    business.googleAccessToken = tokens.access_token;
    business.googleTokenExpiry = tokens.expiry_date;
    await business.save();
  });

  return oauth2Client;
}

export async function fetchAllReviews(business: any) {
  const oauth2Client = await getBusinessOAuthClient(business);
  const accountId = business.googleAccountId;
  const locationId = business.googleLocationId;
  
  if (!accountId || !locationId) {
    throw new Error('Business is missing Google Account ID or Location ID');
  }

  // Handle standard location IDs or the newer format (some locations are returned as 'locations/1234')
  const locStr = locationId.includes('/') ? locationId : `locations/${locationId}`;
  const accStr = accountId.includes('/') ? accountId : `accounts/${accountId}`;

  let allReviews: any[] = [];
  let nextPageToken = '';

  do {
    const url = `https://mybusiness.googleapis.com/v4/${accStr}/${locStr}/reviews${nextPageToken ? `?pageToken=${nextPageToken}` : ''}`;
    
    try {
      const res = await oauth2Client.request({
        url,
        method: 'GET'
      });
      
      const data: any = res.data;
      if (data.reviews) {
        allReviews = allReviews.concat(data.reviews);
      }
      nextPageToken = data.nextPageToken || '';
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn('Reviews endpoint returned 404, the account/location might be invalid or not verified yet.');
        break; // Stop fetching
      }
      throw err;
    }
  } while (nextPageToken);

  return allReviews;
}

export async function replyToReview(business: any, reviewId: string, replyText: string) {
  const oauth2Client = await getBusinessOAuthClient(business);
  const accountId = business.googleAccountId;
  const locationId = business.googleLocationId;
  
  const locStr = locationId.includes('/') ? locationId : `locations/${locationId}`;
  const accStr = accountId.includes('/') ? accountId : `accounts/${accountId}`;
  const revStr = reviewId.includes('/') ? reviewId : `reviews/${reviewId}`;

  const url = `https://mybusiness.googleapis.com/v4/${accStr}/${locStr}/${revStr}/reply`;

  const res = await oauth2Client.request({
    url,
    method: 'PUT',
    data: {
      comment: replyText
    }
  });

  return res.data;
}
