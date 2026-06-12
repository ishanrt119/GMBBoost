import Groq from 'groq-sdk';
import { IAuditData } from '../../models/Audit';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateAIAudit(
  businessData: any
): Promise<IAuditData | string> {

  const prompt = `
You are an elite Google Business Profile consultant,
Local SEO expert,
Reputation management specialist,
and Growth strategist.

Analyze the following business.

BUSINESS NAME:
${businessData.businessName}

CATEGORY:
${businessData.category}

TIER:
${businessData.tier || 'Unknown'}

LOCATION:
${businessData.area || ''}, ${businessData.city || ''}, ${businessData.state || ''}

WEBSITE:
${businessData.website || 'N/A'}

DESCRIPTION:
${businessData.description || 'N/A'}

RATING:
${businessData.rating || 0}

TOTAL REVIEWS:
${businessData.reviewCount || 0}

REVIEWS:
${JSON.stringify(businessData.reviews || [])}

SUPPLIED COMPETITORS:
${businessData.competitors && businessData.competitors.length > 0 ? JSON.stringify(businessData.competitors) : 'No suitable competitors found.'}

Generate a complete GBP audit report.

Return STRICT JSON matching the schema below.

REQUIRED JSON FORMAT:
{
  "executiveSummary": "",
  "overallScore": 0,
  "googleSearchRank": {
    "score": 0,
    "status": ""
  },
  "profileScore": {
    "score": 0,
    "reason": ""
  },
  "seoScore": {
    "score": 0,
    "issues": [],
    "recommendations": []
  },
  "reviewAnalysis": {
    "score": 0,
    "reviewFrequency": "",
    "responseRate": "",
    "sentiment": "",
    "strengths": [],
    "weaknesses": []
  },
  "profileCompletion": {
    "score": 0,
    "completedItems": [],
    "missingItems": []
  },
  "topKeywords": [
    {
      "keyword": "",
      "rank": ""
    }
  ],
  "competitors": [
    {
      "name": "",
      "reviewCount": 0,
      "rating": 0,
      "category": "",
      "distance": "",
      "reason": "",
      "strengthLevel": ""
    }
  ],
  "strengths": [],
  "weaknesses": [],
  "quickWins": [],
  "priorityFixes": [],
  "thirtyDayPlan": [],
  "ninetyDayPlan": [],
  "growthOpportunities": []
}

COMPETITOR ANALYSIS INSTRUCTIONS:
You are given a list of validated competitors. 
You MUST NOT generate new competitors. 
You MUST ONLY analyze competitors supplied in input under "SUPPLIED COMPETITORS".
If the competitor list is empty ("No suitable competitors found."), return an empty array [] for "competitors".
Do not invent any names.

STRENGTHS & WEAKNESSES SECTION:
Never return "Data Unavailable" for strengths. Always generate minimum 3 strengths and minimum 3 weaknesses from Reviews, Ratings, Profile Completion, Website, Services, Description, and Category.
Even if competitor data fails or is empty, ALWAYS return minimum 3 strengths and 3 weaknesses based on the business's own metrics.

FAIL SAFE:
Never generate fake competitors, fake rankings, fake coordinates, or fake visibility grids.
If you cannot confidently generate data for this business, return the exact string: "Data Unavailable" (do NOT return JSON if you are not confident).
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0].message?.content;
    if (!content) throw new Error('No content returned from Groq AI');

    if (content.trim() === 'Data Unavailable' || content.includes('Data Unavailable')) {
      return "Data Unavailable";
    }

    // Try to extract JSON if it was wrapped in markdown
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;

    const parsed = JSON.parse(jsonStr);
    return parsed as IAuditData;
  } catch (error: any) {
    console.error('Error generating AI audit:', error);
    throw new Error(`Failed to generate AI audit: ${error.message || error}`);
  }
}
