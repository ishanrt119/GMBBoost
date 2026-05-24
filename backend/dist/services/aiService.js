"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIReply = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const generateAIReply = async (reviewText, rating, reviewerName) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are a professional customer service representative. Generate a polite, empathetic and professional reply to the following customer review.

Reviewer: ${reviewerName}
Rating: ${rating}/5
Review: ${reviewText}

Guidelines:
- Keep the reply under 100 words
- Be professional and friendly
- Address the specific points mentioned
- If rating is low, apologize and offer to improve
- If rating is high, thank them warmly
- Do not use generic responses

Reply:`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
    catch (error) {
        console.error('Gemini AI error:', error);
        throw error;
    }
};
exports.generateAIReply = generateAIReply;
