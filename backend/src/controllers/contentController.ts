import { Request, Response } from 'express';
import { generateContent } from '../services/aiService';
import {
  saveGeneratedContent,
  getContentHistory,
  deleteContent,
  decrementCredits,
  getProfileByUserId,
} from '../database/queries';
import { GenerateContentRequest } from '../types';

export async function generate(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const requestData: GenerateContentRequest = req.body;

    // Check credits
    const profile = await getProfileByUserId(userId);
    if (!profile || profile.credits <= 0) {
      res.status(402).json({ success: false, message: 'Insufficient credits. Please upgrade your plan.' });
      return;
    }

    const aiResult = await generateContent(requestData);

    // Save to DB and decrement credits atomically
    const [saved] = await Promise.all([
      saveGeneratedContent(userId, {
        business_name: requestData.business_name,
        business_type: requestData.business_type,
        location: requestData.location,
        keywords: requestData.keywords,
        tone: requestData.tone,
        content_type: requestData.content_type,
        title: aiResult.title,
        content: aiResult.content,
        hashtags: aiResult.hashtags,
        cta: aiResult.cta,
        seo_score: aiResult.seo_score,
      }),
      decrementCredits(userId),
    ]);

    res.status(201).json({
      success: true,
      message: 'Content generated successfully.',
      data: saved,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Content generation failed.';
    res.status(500).json({ success: false, message });
  }
}

export async function regenerate(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const requestData: GenerateContentRequest = req.body;

    const profile = await getProfileByUserId(userId);
    if (!profile || profile.credits <= 0) {
      res.status(402).json({ success: false, message: 'Insufficient credits.' });
      return;
    }

    const aiResult = await generateContent(requestData);

    const [saved] = await Promise.all([
      saveGeneratedContent(userId, {
        business_name: requestData.business_name,
        business_type: requestData.business_type,
        location: requestData.location,
        keywords: requestData.keywords,
        tone: requestData.tone,
        content_type: requestData.content_type,
        title: aiResult.title,
        content: aiResult.content,
        hashtags: aiResult.hashtags,
        cta: aiResult.cta,
        seo_score: aiResult.seo_score,
      }),
      decrementCredits(userId),
    ]);

    res.status(201).json({
      success: true,
      message: 'Content regenerated successfully.',
      data: saved,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Regeneration failed.';
    res.status(500).json({ success: false, message });
  }
}

export async function history(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page, limit, content_type, tone, search } = req.query;

    const result = await getContentHistory(userId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      content_type: content_type as string | undefined,
      tone: tone as string | undefined,
      search: search as string | undefined,
    });

    res.status(200).json({ success: true, data: result.data, total: result.count });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch history.';
    res.status(500).json({ success: false, message });
  }
}

export async function deleteContentHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await deleteContent(id, userId);

    res.status(200).json({ success: true, message: 'Content deleted successfully.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete content.';
    res.status(500).json({ success: false, message });
  }
}
