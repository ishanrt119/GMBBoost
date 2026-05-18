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
    content: `You are a highly skilled, friendly, and professional AI sales assistant for a modern SaaS platform.
    
    Your goal is to qualify leads, gather requirements, and build a relationship.
    Current Lead context:
    - Name: ${lead.name !== lead.phone ? lead.name : "Not provided yet"}
    - Status: ${lead.status}
    - Known Notes/Interest: ${lead.interest || lead.notes || "None"}
    
    Guidelines:
    - Keep responses concise, natural, and conversational (WhatsApp style).
    - If you don't know their name, politely ask for it.
    - Ask questions one at a time to qualify them (business type, requirements, budget, timeline).
    - Maintain a helpful, persuasive, yet non-pushy tone.
    - Use emojis naturally but sparingly.
    `
  };

  const messages = [systemPrompt, ...history.map(msg => ({ role: msg.role, content: msg.content }))] as any;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile", // Using a reliable groq model
      temperature: 0.7,
      max_tokens: 256,
    });

    return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Can you please repeat?";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I am currently experiencing technical difficulties. Our team will get back to you shortly.";
  }
}
