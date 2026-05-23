import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error('GROQ_API_KEY is missing from .env');
}

export const groq = new Groq({ apiKey });

// Export as openai-named var so no other files need changing
export const openai = groq;

export default groq;
