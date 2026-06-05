import Groq from 'groq-sdk';
import { GMBBusinessData } from '../gmb/provider';
import { IAuditData, IRecommendation, ICompetitor } from '../../models/Audit';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

import { GBPScoreDetails } from '../audit/scoringEngine';

export interface AIAuditResult {
  recommendations: IRecommendation[];
  quickWins: string[];
  strengths: string[];
  weaknesses: string[];
  seoInsights: string;
  reviewInsights: string;
  contentInsights: string;
  growthOpportunities: string;
  competitorGapAnalysis: string;
  keywordGapAnalysis: any[];
  industryBenchmarking: any;
}

export async function generateAIAudit(
  businessData: GMBBusinessData,
  scoreDetails: GBPScoreDetails,
  competitors: any[],
  rankGrid: any,
  tier: number,
  revenueOpportunity: any
): Promise<AIAuditResult> {
  const prompt = `
You are an expert local SEO and Google Business Profile consultant. Analyze the following business profile data and return STRICT JSON matching the required schema.

BUSINESS DATA:
${JSON.stringify(businessData, null, 2)}

CALCULATED SCORES & TIER (Tier ${tier}):
${JSON.stringify(scoreDetails, null, 2)}

COMPETITORS:
${JSON.stringify(competitors, null, 2)}

RANK GRID:
${JSON.stringify(rankGrid, null, 2)}

REVENUE OPPORTUNITY:
${JSON.stringify(revenueOpportunity, null, 2)}

REQUIRED JSON OUTPUT SCHEMA:
{
  "recommendations": [
    {
      "title": "string",
      "impact": "High" | "Medium" | "Low",
      "effort": "High" | "Medium" | "Low",
      "description": "string"
    }
  ], // Array of EXACTLY 9 recommendations. Top 3 are for Month 1 (30-Day Plan), next 3 for Month 2 (60-Day), final 3 for Month 3 (90-Day).
  "quickWins": ["string", "string", "string"], 
  "strengths": ["string"],
  "weaknesses": ["string"],
  "seoInsights": "string",
  "reviewInsights": "string (Focus on Review Intelligence: positive/negative themes, sentiment, recurring complaints/strengths)",
  "contentInsights": "string",
  "growthOpportunities": "string",
  "competitorGapAnalysis": "string (You vs Best Competitor)",
  "keywordGapAnalysis": [
    {
      "keyword": "string",
      "volume": 0,
      "difficulty": 0,
      "opportunityScore": 0,
      "currentRank": 0,
      "competitorRank": 0
    }
  ], // Exact 3 keywords
  "industryBenchmarking": {
    "industryAverage": "string",
    "top25Percent": "string",
    "top10Percent": "string"
  }
}

Ensure the response is ONLY valid JSON.
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error('No content returned from Groq AI');
    }

    const parsed = JSON.parse(content) as AIAuditResult;
    
    // Basic structural validation can be added here (e.g., Zod)
    return parsed;
  } catch (error: any) {
    console.error('Error generating AI audit:', error);
    throw new Error(`Failed to generate AI audit: ${error.message || error}`);
  }
}

