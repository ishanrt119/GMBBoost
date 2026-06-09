/**
 * auditEngine.ts
 *
 * Uses Groq LLM ONLY for qualitative analysis and recommendations.
 * Competitors and rankings come from real APIs (Google Places / SERPAPI).
 * The LLM is explicitly told NOT to invent competitor data.
 */
import Groq from 'groq-sdk';
import { GMBBusinessData } from '../gmb/provider';
import { IAuditData, ICompetitor, IKeywordRanking } from '../../models/Audit';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AIAuditResult extends IAuditData {
  servicesCount: number;
  categoriesCount: number;
  competitors: ICompetitor[];
}

export async function generateAIAudit(
  businessData: GMBBusinessData,
  realCompetitors: ICompetitor[],     
  realKeywordRankings: IKeywordRanking[], 
  targetCategory: string              
): Promise<AIAuditResult> {

  const prompt = `
You are an expert local SEO and Google Business Profile consultant.
Analyze the following REAL business profile data and return STRICT JSON matching the schema below.

BUSINESS DATA:
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

REAL COMPETITORS (from SERP / Maps):
${JSON.stringify(realCompetitors, null, 2)}

REAL KEYWORD RANKINGS (from SERPAPI):
${JSON.stringify(realKeywordRankings, null, 2)}

REQUIRED JSON OUTPUT SCHEMA:
{
  "executiveSummary": "string (2-3 paragraphs summarizing their digital presence)",
  "businessHealthScore": number (0-100, overall health),
  "seoScore": number (0-100, based on keyword rankings),
  "profileScore": number (0-100, based on completeness),
  "reviewScore": number (0-100, based on rating and count),
  "searchVisibilityScore": number (0-100, compared to competitors),
  "competitorAnalysis": "string (analysis of how they compare to the REAL competitors provided)",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "keywordOpportunities": ["string", "string", "string"],
  "reviewOpportunities": ["string", "string", "string"],
  "growthOpportunities": ["string", "string", "string"],
  "actionPlan30Day": ["string", "string", "string", "string", "string"],
  "roadmap90Day": ["string", "string", "string", "string", "string"],
  "priorityRecommendations": ["string", "string", "string"],
  "servicesCount": number (estimate how many services this business should have based on category),
  "categoriesCount": number (estimate how many categories apply)
}

IMPORTANT RULES:
- Do NOT invent competitor names. Use ONLY the ones provided in the prompt.
- Do NOT invent keyword ranks. Use ONLY the real ones provided.
- If no competitors are provided, state that local data is sparse instead of making them up.
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
      executiveSummary: parsed.executiveSummary || 'Audit analysis unavailable.',
      businessHealthScore: parsed.businessHealthScore ?? 0,
      seoScore: parsed.seoScore ?? 0,
      profileScore: parsed.profileScore ?? 0,
      reviewScore: parsed.reviewScore ?? 0,
      searchVisibilityScore: parsed.searchVisibilityScore ?? 0,
      competitorAnalysis: parsed.competitorAnalysis || 'Competitor data analysis unavailable.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      keywordOpportunities: Array.isArray(parsed.keywordOpportunities) ? parsed.keywordOpportunities : [],
      reviewOpportunities: Array.isArray(parsed.reviewOpportunities) ? parsed.reviewOpportunities : [],
      growthOpportunities: Array.isArray(parsed.growthOpportunities) ? parsed.growthOpportunities : [],
      actionPlan30Day: Array.isArray(parsed.actionPlan30Day) ? parsed.actionPlan30Day : [],
      roadmap90Day: Array.isArray(parsed.roadmap90Day) ? parsed.roadmap90Day : [],
      priorityRecommendations: Array.isArray(parsed.priorityRecommendations) ? parsed.priorityRecommendations : [],
      servicesCount: parsed.servicesCount ?? 0,
      categoriesCount: parsed.categoriesCount ?? 0,
      competitors: realCompetitors
    };
  } catch (error: any) {
    console.error('Error generating AI audit:', error);
    throw new Error(`Failed to generate AI audit: ${error.message || error}`);
  }
}
