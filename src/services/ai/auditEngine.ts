import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateAIAudit(
  businessData: any
): Promise<any> {

  const prompt = `
You are an elite Enterprise Business Intelligence Engine & Local SEO strategist.

Your job is strictly to ANALYZE the explicit FACTS provided below. DO NOT invent competitors, DO NOT invent rankings, DO NOT invent metrics.

FACTS:
BUSINESS NAME: ${businessData.businessName}
CATEGORY: ${businessData.category}
DESCRIPTION: ${businessData.description || 'Missing'}

COMPETITOR INTELLIGENCE:
${businessData.competitors && businessData.competitors.length > 0 ? JSON.stringify(businessData.competitors) : 'No suitable competitors found.'}

REVIEWS:
${JSON.stringify(businessData.reviews?.slice(0, 5) || [])}

TASK:
Based strictly on the facts above, generate the missing analytical sections of the audit report.

REQUIRED JSON FORMAT:
{
  "keywordGapAnalysis": [
    {
      "keyword": "example missing keyword",
      "found": false,
      "missing": true,
      "priority": "High"
    }
  ],
  "reviewAnalysis": {
    "positivePercent": 0,
    "neutralPercent": 0,
    "negativePercent": 0,
    "mostCommonPraises": ["praise 1", "praise 2"],
    "mostCommonComplaints": ["complaint 1"]
  }
}

RULES:
1. "keywordGapAnalysis" MUST evaluate competitor keywords vs the business's category/description.
2. "reviewAnalysis" MUST calculate sentiment strictly from the 5 REVIEWS provided above.
3. NOTHING ELSE. No extra fields. DO NOT hallucinate text outside these two objects.
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0].message?.content;
    if (!content) throw new Error('No content returned from Groq AI');

    const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;

    const parsed = JSON.parse(jsonStr.trim());
    return parsed;
  } catch (error: any) {
    console.error('Error generating AI audit:', error);
    throw new Error(`Failed to generate AI audit: ${error.message || error}`);
  }
}
