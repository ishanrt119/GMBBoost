const Groq = require('groq-sdk');
const { getSystemPrompt } = require('../prompts/system.prompt');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getReply = async (conversationHistory) => {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',  // free model
    messages: [
      { role: 'system', content: getSystemPrompt() },
      ...conversationHistory
    ],
    max_tokens: 300
  });

  return response.choices[0].message.content;
};

module.exports = { getReply };