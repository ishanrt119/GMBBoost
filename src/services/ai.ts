import Groq from "groq-sdk";
import { ILead } from "@/models/Lead";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function generateSalesResponse(history: Message[], lead: ILead): Promise<string> {
  const systemPrompt: Message = {
    role: 'system',
    content: `You are a professional AI sales assistant and Lead Conversion Agent for a business automation platform.

Your responsibilities:
- Talk naturally with users and maintain conversational context.
- Understand customer requirements and subtly extract business information.
- Qualify leads gradually (do not interrogate). Ask ONE meaningful question at a time.
- Detect buying intent and assist with bookings/demo scheduling if they show high interest.
- Keep responses short, concise, and natural (1-3 brief paragraphs max).

Current Lead context:
- Name: ${lead.name !== lead.phone ? lead.name : "Not provided yet"}
- Status: ${lead.qualificationStatus || lead.status}
- Known Info: Business (${lead.businessType || 'unknown'}), Budget (${lead.budget || 'unknown'}), Urgency (${lead.urgency || 'unknown'})

Rules:
- NO random emojis. NO media generation.
- NEVER repeat fallback messages continuously.
- Avoid robotic, scripted conversations.
- If they ask to book a call, offer to help them schedule a time.
- Maintain a business-professional yet approachable tone.`
  };

  const messages = [systemPrompt, ...history.map(msg => ({ role: msg.role, content: msg.content }))] as any;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 300,
    });

    let content = chatCompletion.choices[0]?.message?.content || "";
    
    // AI Response Sanitization
    content = content.replace(/\*\*/g, '');
    content = content.replace(/\*/g, '');
    content = content.replace(/!\[.*?\]\(.*?\)/g, '');
    content = content.trim().replace(/\n{3,}/g, '\n\n');

    if (!content) {
      return "Sorry, I’m facing a temporary issue right now. Please try again in a moment.";
    }

    return content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I’m facing a temporary issue right now. Please try again in a moment.";
  }
}

export async function extractLeadInsights(history: Message[], currentInsights: any = {}): Promise<any> {
  const systemPrompt: Message = {
    role: 'system',
    content: `You are an AI data extraction engine.
Analyze the following conversation between a user and an AI sales assistant.
Extract or update the following business information based strictly on the user's messages.
If information is not explicitly mentioned, retain the current value or output null.

Output ONLY valid JSON matching this schema:
{
  "businessType": string | null,
  "budget": string | null,
  "urgency": string | null,
  "requirements": string | null,
  "intentScore": number (0-100),
  "qualificationStatus": "Unqualified" | "Qualified" | "Sales Ready"
}

Scoring rules:
- Mentions budget -> +15 intent
- Urgent -> +20 intent
- Asks for pricing/demo -> +25 intent
- Negative response -> decrease intent

Current Insights: ${JSON.stringify(currentInsights)}
`
  };

  const messages = [
    systemPrompt, 
    { role: 'user', content: JSON.stringify(history.map(h => ({ role: h.role, text: h.content }))) }
  ] as any;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // Strict factual extraction
      response_format: { type: 'json_object' }
    });

    const output = chatCompletion.choices[0]?.message?.content || "{}";
    const insights = JSON.parse(output);
    return insights;
  } catch (error) {
    console.error("Error extracting AI insights:", error);
    return null;
  }
}

const postTypes = [
  "PROMOTIONAL",
  "EDUCATIONAL",
  "TIPS",
  "FAQ",
  "OFFER",
  "MOTIVATIONAL",
  "LOCAL_SEO"
];

function getRandomPostType() {
  return postTypes[Math.floor(Math.random() * postTypes.length)];
}

export async function generatePost(businessData: any) {
  try {
    const postType = getRandomPostType();
    const prompt = `
You are an expert local business marketing strategist.

Generate ONE unique Google Business Profile style post.

BUSINESS DETAILS:
Business Name: ${businessData.name || businessData.businessName}
Business Type: ${businessData.category || businessData.businessType}
City: ${businessData.city || businessData.address}
Services: ${businessData.services || 'General'}
Offers: ${businessData.offers || 'None'}
Tone: ${businessData.tone || 'professional'}
Phone: ${businessData.phone || ''}
Website: ${businessData.website || ''}

POST TYPE:
${postType}

IMPORTANT RULES:
1. Keep post between 80-150 words
2. Make content engaging and human-like
3. Add strong CTA
4. Include city name naturally for local SEO
5. Avoid repetitive wording
6. Do NOT use placeholders like [insert phone]
7. Do NOT generate very long paragraphs
8. Add 3-5 relevant hashtags
9. Make content suitable for Google Business Profile
10. Make every post different from previous ones

EXAMPLES OF POST TYPES:
- PROMOTIONAL → promote services
- EDUCATIONAL → give useful advice
- TIPS → quick tips
- FAQ → answer customer questions
- OFFER → promote offers
- MOTIVATIONAL → inspiring customer-focused content
- LOCAL_SEO → location-based visibility content

Generate high-quality content now.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a professional local SEO and social media marketing expert."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || null;
  } catch (err: any) {
    console.error("Groq Error:", err.message);
    return null;
  }
}
