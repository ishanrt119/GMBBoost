import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const getFallbackReply = (reviewText: string, rating: number, reviewerName: string): string => {
  const text = reviewText.toLowerCase();

  // 5 star replies
  if (rating === 5) {
    if (text.includes('food') || text.includes('delicious') || text.includes('taste')) {
      return `Wow, thank you so much, ${reviewerName}! 😊 We're absolutely delighted to hear that you loved the food. Our team puts a lot of heart into every dish, and your kind words truly mean the world to us. We can't wait to welcome you back soon!`;
    }
    if (text.includes('staff') || text.includes('service') || text.includes('helpful')) {
      return `Thank you for the wonderful feedback, ${reviewerName}! Our team will be so happy to hear this. We truly believe that great service makes all the difference, and it's heartwarming to know we delivered that for you. See you again soon!`;
    }
    if (text.includes('ambience') || text.includes('atmosphere') || text.includes('place') || text.includes('beautiful')) {
      return `That means so much to us, ${reviewerName}! We put a lot of thought into creating a warm and welcoming atmosphere, and it's wonderful to know you felt that. Thank you for taking the time to share your experience with us!`;
    }
    return `Thank you so much, ${reviewerName}! Reading reviews like yours genuinely makes our day. We're so glad everything was up to the mark and that you had a great experience. Your support motivates us to keep doing what we love. Hope to see you again very soon! 🙏`;
  }

  // 4 star replies
  if (rating === 4) {
    if (text.includes('wait') || text.includes('slow') || text.includes('time')) {
      return `Thank you for your honest feedback, ${reviewerName}! We're really glad you had a good experience overall. We completely understand your concern about the wait time and we're actively working on improving that. Your feedback helps us get better every day. Hope to serve you even better next time!`;
    }
    if (text.includes('price') || text.includes('expensive') || text.includes('cost') || text.includes('value')) {
      return `Thank you for sharing your thoughts, ${reviewerName}! We're happy you enjoyed your visit. We always strive to offer the best value for our guests and your feedback about pricing is something we'll definitely take into consideration. Looking forward to seeing you again!`;
    }
    if (text.includes('food') || text.includes('taste') || text.includes('menu')) {
      return `Thank you for the lovely feedback, ${reviewerName}! We're so glad you enjoyed your experience. We're always looking to improve our menu and your thoughts really help us do that. Hope to delight you even more on your next visit!`;
    }
    return `Thank you for the great review, ${reviewerName}! We're really glad you had a positive experience with us. We're always working hard to make things even better, and your feedback helps us do exactly that. We'd love to see you again soon and make your next visit a 5-star one! 😊`;
  }

  // 3 star replies
  if (rating === 3) {
    if (text.includes('average') || text.includes('okay') || text.includes('decent') || text.includes('okay')) {
      return `Thank you for taking the time to share your feedback, ${reviewerName}. We're glad your experience was satisfactory, but we know we can do better than just okay! We'd love to understand what would have made your visit more special. Please do give us another chance — we promise to make it worth your while!`;
    }
    if (text.includes('food') || text.includes('taste') || text.includes('menu')) {
      return `Thank you for your honest review, ${reviewerName}. We appreciate you sharing your thoughts on the food. We're always working on improving our menu and your feedback gives us valuable direction. We hope you'll visit us again and give us a chance to impress you!`;
    }
    if (text.includes('staff') || text.includes('service') || text.includes('rude') || text.includes('attitude')) {
      return `Thank you for your feedback, ${reviewerName}. We're sorry to hear that the service didn't fully meet your expectations. We hold our team to high standards and will be addressing this internally. We really hope you'll give us another opportunity to show you the experience you truly deserve!`;
    }
    return `Thank you for your feedback, ${reviewerName}. We appreciate your honesty and are sorry to hear your experience was just average. We genuinely care about every guest's experience and would love to know more about what we could have done better. Please do visit us again — we'd love the chance to make it up to you!`;
  }

  // 2 star replies
  if (rating === 2) {
    if (text.includes('cold') || text.includes('food') || text.includes('taste')) {
      return `We're really sorry to hear this, ${reviewerName}. Cold or poorly prepared food is simply not acceptable and we sincerely apologize for falling short of your expectations. This will be looked into immediately with our kitchen team. We'd love the opportunity to make this right for you — please reach out to us directly and we'll take care of you!`;
    }
    if (text.includes('staff') || text.includes('rude') || text.includes('behaviour') || text.includes('attitude')) {
      return `We sincerely apologize, ${reviewerName}. The behaviour you experienced is absolutely not a reflection of the standards we hold ourselves to. We take this very seriously and will be addressing it with our team right away. We truly hope you'll give us one more chance to show you the hospitality you deserve.`;
    }
    if (text.includes('wait') || text.includes('slow') || text.includes('long')) {
      return `We're so sorry for the long wait, ${reviewerName}. We completely understand how frustrating that can be and we sincerely apologize. We're working on improving our processes to ensure this doesn't happen again. Thank you for your patience and for letting us know — your feedback is invaluable to us.`;
    }
    return `We're truly sorry to hear about your experience, ${reviewerName}. This is not the standard we strive for and we sincerely apologize. Please know that your feedback has been taken seriously and we are working to make improvements. We'd really love the chance to make things right — please reach out to us directly!`;
  }

  // 1 star replies
  if (rating === 1) {
    if (text.includes('worst') || text.includes('terrible') || text.includes('horrible') || text.includes('disgusting')) {
      return `We are deeply sorry to hear about your experience, ${reviewerName}. There is absolutely no excuse for what you went through and we sincerely apologize. This kind of feedback, while hard to read, is exactly what pushes us to do better. We would really appreciate the chance to speak with you directly and make this right. Please reach out to us — you deserve so much better than this.`;
    }
    if (text.includes('never') || text.includes('again') || text.includes('coming back')) {
      return `We completely understand your frustration, ${reviewerName}, and we are truly sorry. Losing a guest's trust is something we take very seriously. We would love the opportunity to personally reach out and make amends. Please give us one more chance — we promise to do everything in our power to turn this experience around for you.`;
    }
    if (text.includes('food') || text.includes('taste') || text.includes('quality')) {
      return `We sincerely apologize for the poor food quality you experienced, ${reviewerName}. This is completely unacceptable and not something we take lightly. Our kitchen team will be informed immediately. We would love to have you back and personally ensure your next experience is everything it should have been. Please reach out to us directly!`;
    }
    return `We are so sorry, ${reviewerName}. Reading this genuinely breaks our heart because every guest deserves a wonderful experience, and we clearly let you down. Please know that your feedback has been heard loud and clear. We would love the opportunity to speak with you personally and make things right. Thank you for taking the time to let us know — it truly helps us improve.`;
  }

  return `Thank you for your feedback, ${reviewerName}. We truly value your thoughts and will use them to improve our services. We hope to have the pleasure of serving you again soon!`;
};

export const generateAIReply = async (reviewText: string, rating: number, reviewerName: string): Promise<string> => {
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
  } catch (error) {
    console.error('Gemini AI error - using smart fallback');
    return getFallbackReply(reviewText, rating, reviewerName);
  }
};