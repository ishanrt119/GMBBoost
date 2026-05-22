require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env")
});

const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
  return postTypes[
    Math.floor(Math.random() * postTypes.length)
  ];
}

async function generatePost(businessData) {

  try {

    const postType = getRandomPostType();

    const prompt = `
You are an expert local business marketing strategist.

Generate ONE unique Google Business Profile style post.

BUSINESS DETAILS:
Business Name: ${businessData.businessName}
Business Type: ${businessData.businessType}
City: ${businessData.city}
Services: ${businessData.services}
Offers: ${businessData.offers}
Tone: ${businessData.tone}
Phone: ${businessData.phone}
Website: ${businessData.website}

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

    const response =
      await client.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "system",
            content:
              "You are a professional local SEO and social media marketing expert."
          },
          {
            role: "user",
            content: prompt
          }
        ],

        temperature: 0.9,
        max_tokens: 300,

      });

    return response.choices[0].message.content;

  }

  catch (err) {

    console.log(
      "Groq Error:",
      err.message
    );

    return null;
  }
}

module.exports = {
  generatePost
};