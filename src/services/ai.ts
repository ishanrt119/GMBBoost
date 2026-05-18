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
    content: `You are a professional AI sales and CRM assistant for a business automation platform.

Your responsibilities:
- Talk naturally with users
- Understand customer requirements
- Qualify leads
- Ask relevant follow-up questions
- Maintain conversational context
- Respond professionally and concisely

Current Lead context:
- Name: ${lead.name !== lead.phone ? lead.name : "Not provided yet"}
- Status: ${lead.status}
- Known Notes/Interest: ${lead.interest || lead.notes || "None"}

Rules:
- Never send random emojis
- Never send images/media
- Never repeat fallback messages continuously
- Never hallucinate unsupported functionality
- If input is unclear, ask politely for clarification once
- Keep replies under 2-3 short paragraphs
- Avoid robotic repetition
- Maintain business-professional tone.`
  };

  const messages = [systemPrompt, ...history.map(msg => ({ role: msg.role, content: msg.content }))] as any;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.6, // lowered slightly for stability
      max_tokens: 300,
    });

    let content = chatCompletion.choices[0]?.message?.content || "";
    
    // AI Response Sanitization
    content = content.replace(/\*\*/g, ''); // Remove bold markdown
    content = content.replace(/\*/g, ''); // Remove italics markdown
    content = content.replace(/!\[.*?\]\(.*?\)/g, ''); // Remove markdown images
    
    // Simple deduplication/trimming of extra spacing
    content = content.trim().replace(/\n{3,}/g, '\n\n');
    
    // Remove excessive emojis (basic regex for most emojis, simplified approach is just relying on prompt)
    // The prompt is very strict on "Never send random emojis", which usually suffices.

    if (!content) {
      return "Sorry, I’m facing a temporary issue right now. Please try again in a moment.";
    }

    return content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I’m facing a temporary issue right now. Please try again in a moment.";
  }
}
