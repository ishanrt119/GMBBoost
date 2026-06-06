/**
 * auditEngine.ts
 *
 * Uses Groq LLM ONLY for qualitative analysis and recommendations.
 * Competitors and rankings come from real APIs (Google Places / SERPAPI).
 * The LLM is explicitly told NOT to invent competitor data.
 */
import Groq from 'groq-sdk';
import { GMBBusinessData } from '../gmb/provider';
import { IAuditData, IRecommendation, ICompetitor } from '../../models/Audit';
import { IKeywordRanking } from '../../models/Audit';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AIAuditResult extends IAuditData {
  overallScore: number;
  recommendations: IRecommendation[];
  competitors: ICompetitor[];         // populated from real data, not AI
  keywords: string[];                 // target keywords AI suggests for this business
  servicesCount: number;              // AI estimates based on business type
  categoriesCount: number;            // AI estimates based on business type
}

export async function generateAIAudit(
  businessData: GMBBusinessData,
  realCompetitors: ICompetitor[],     // from Google Places Nearby Search
  realKeywordRankings: IKeywordRanking[], // from SERPAPI
  targetCategory: string              // userDefinedCategory
): Promise<AIAuditResult> {
  const hasRealCompetitors = realCompetitors.length > 0;
  const hasRealRankings    = realKeywordRankings.length > 0 && realKeywordRankings[0].source === 'serpapi';

  const prompt = `
You are an expert local SEO and Google Business Profile consultant.
Analyze the following REAL business profile data and return STRICT JSON.

BUSINESS DATA (from Google Places API):
${JSON.stringify({
  name:           businessData.businessName,
  location:       businessData.location,
  rating:         businessData.rating,
  reviewsCount:   businessData.reviewsCount,
  categories:     businessData.categories,
  primaryCategory: targetCategory,
  photosCount:    businessData.photosCount,
  businessHours:  businessData.businessHours,
  hasWebsite:     businessData.hasWebsite,
  hasPhone:       businessData.hasPhone,
  hasDescription: businessData.hasDescription,
  description:    businessData.description,
  reviews:        businessData.reviews.slice(0, 5),
}, null, 2)}

REAL COMPETITORS (from Google Places Nearby Search — DO NOT change or invent):
${JSON.stringify(realCompetitors, null, 2)}

REAL KEYWORD RANKINGS (from SERPAPI — DO NOT change):
${JSON.stringify(realKeywordRankings, null, 2)}

REQUIRED JSON OUTPUT SCHEMA:
{
  "overallScore": number (0-100, calculated from: rating*10 + completeness + keyword presence + review velocity),
  "completenessScore": number (0-100, based on how many GBP fields are filled),
  "keywordScore": number (0-100, based on avg keyword rank — rank 1 = 100, rank 20 = 5),
  "sentimentScore": number (0-100, based on review ratings and sentiment),
  "engagementScore": number (0-100, based on review count, photos, posts),
  "servicesCount": number (estimate how many services this type of business should have listed),
  "categoriesCount": number (how many categories are present based on data),
  "keywords": ["string"] // EXACTLY 5 real search queries customers use for this business in this location,
  "recommendations": [
    {
      "title": "string",
      "impact": "High" | "Medium" | "Low",
      "effort": "High" | "Medium" | "Low",
      "description": "string (specific, actionable, based on the REAL data above)"
    }
  ], // EXACTLY 10 recommendations based on gaps found in the REAL data
  "quickWins": ["string", "string", "string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "seoInsights": "string (mention specific missing keywords and where they should appear)",
  "reviewInsights": "string (based on REAL review count and ratings)",
  "contentInsights": "string",
  "growthOpportunities": "string"
}

IMPORTANT RULES:
- Do NOT invent competitor names, ratings, or review counts.
- Do NOT invent keyword ranks.
- The competitors array in your response should be EMPTY — real competitors are already provided.
- All analysis must be grounded in the real data provided above.
- Respond ONLY with valid JSON.
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0].message?.content;
    if (!content) throw new Error('No content returned from Groq AI');

    const parsed = JSON.parse(content);

    return {
      overallScore:      parsed.overallScore      ?? 0,
      completenessScore: parsed.completenessScore ?? 0,
      keywordScore:      parsed.keywordScore      ?? 0,
      sentimentScore:    parsed.sentimentScore    ?? 0,
      engagementScore:   parsed.engagementScore   ?? 0,
      servicesCount:     parsed.servicesCount     ?? 0,
      categoriesCount:   parsed.categoriesCount   ?? 0,
      keywords:          parsed.keywords          ?? [],
      recommendations:   (parsed.recommendations  ?? []).slice(0, 10),
      competitors:       realCompetitors,          // always use real data
      quickWins:         parsed.quickWins         ?? [],
      strengths:         parsed.strengths         ?? [],
      weaknesses:        parsed.weaknesses        ?? [],
      seoInsights:       parsed.seoInsights       ?? '',
      reviewInsights:    parsed.reviewInsights    ?? '',
      contentInsights:   parsed.contentInsights   ?? '',
      growthOpportunities: parsed.growthOpportunities ?? '',
    };
  } catch (error: any) {
    console.error('Error generating AI audit:', error);
    throw new Error(`Failed to generate AI audit: ${error.message || error}`);
  }
}
