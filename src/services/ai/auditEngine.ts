import Groq from 'groq-sdk';
import { GMBBusinessData } from '../gmb/provider';
import { IAuditData, IRecommendation, ICompetitor } from '../../models/Audit';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AIAuditResult extends IAuditData {
  overallScore: number;
  recommendations: IRecommendation[];
  competitors: ICompetitor[];
}

export async function generateAIAudit(businessData: GMBBusinessData): Promise<AIAuditResult> {
  const prompt = `
You are an expert local SEO and Google Business Profile consultant. Analyze the following business profile data and return STRICT JSON matching the required schema.

BUSINESS DATA:
${JSON.stringify(businessData, null, 2)}

REQUIRED JSON OUTPUT SCHEMA:
{
  "overallScore": 0-100,
  "completenessScore": 0-100,
  "keywordScore": 0-100,
  "sentimentScore": 0-100,
  "engagementScore": 0-100,
  "competitors": [
    {
      "name": "string",
      "score": 0-100,
      "reviews": number,
      "rating": number,
      "postsPerMonth": number
    }
  ], // Array of EXACTLY 3 competitors (make up realistic local competitors based on the business category and location if needed)
  "recommendations": [
    {
      "title": "string",
      "impact": "High" | "Medium" | "Low",
      "effort": "High" | "Medium" | "Low",
      "description": "string"
    }
  ], // EXACTLY 10 actionable recommendations
  "quickWins": ["string", "string", "string"], // EXACTLY 3 quick wins
  "strengths": ["string"],
  "weaknesses": ["string"],
  "seoInsights": "string",
  "reviewInsights": "string",
  "contentInsights": "string",
  "growthOpportunities": "string"
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

