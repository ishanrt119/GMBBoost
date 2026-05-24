// src/controllers/ai.controller.js
// Uses Groq API (OpenAI-compatible) — https://console.groq.com/keys
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Groq's fastest & most capable model as of 2025
const MODEL = 'llama-3.3-70b-versatile';

// POST /api/ai/suggestions
exports.generateSuggestions = async (req, res, next) => {
  try {
    const { service, businessName, customerName, rating = 5 } = req.body;

    const prompt = `You are helping a customer write a genuine Google review for a business.

Business: ${businessName || 'the business'}
Customer name: ${customerName || 'a customer'}
Service received: ${service || 'general service'}
Desired star rating: ${rating} out of 5

Generate exactly 3 short, natural, authentic-sounding Google review drafts that the customer can edit and post.
Each review should:
- Sound like a real person wrote it (not AI)
- Be 20-40 words
- Mention the service if provided
- Match the star rating in tone
- Be unique in phrasing

Return a JSON array like:
[
  { "rating": 5, "text": "..." },
  { "rating": 5, "text": "..." },
  { "rating": 4, "text": "..." }
]
Return ONLY the JSON array, no other text.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
    });

    const raw         = completion.choices[0].message.content.trim();
    const json        = raw.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(json);

    res.json({ success: true, suggestions, model: MODEL });
  } catch (err) { next(err); }
};

// POST /api/ai/personalize-message
exports.personalizeMessage = async (req, res, next) => {
  try {
    const { customerName, service, businessName, channel = 'whatsapp' } = req.body;

    const prompt = `Write a short, friendly ${channel} message to ${customerName || 'the customer'} asking them to leave a Google review for ${businessName || 'our business'} after their ${service || 'recent visit'}.

Rules:
- Warm and personal, not salesy
- Under 60 words
- Include a placeholder {{review_link}} where the link goes
- Use 1-2 emojis max
- Do NOT include subject lines
Return only the message text.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    res.json({ success: true, message: completion.choices[0].message.content.trim(), model: MODEL });
  } catch (err) { next(err); }
};
