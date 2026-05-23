'use client';

import { useState } from 'react';
import { contentService } from '@/services/api';
import { GeneratedContent, GenerateFormData } from '@/types';
import toast from 'react-hot-toast';

export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);

  const generate = async (data: GenerateFormData) => {
    setIsGenerating(true);
    try {
      const res = await contentService.generate(data);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Content generated successfully!');
        return res.data;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      toast.error(msg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerate = async (data: GenerateFormData) => {
    setIsRegenerating(true);
    try {
      const res = await contentService.regenerate(data);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Content regenerated!');
        return res.data;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Regeneration failed';
      toast.error(msg);
      throw err;
    } finally {
      setIsRegenerating(false);
    }
  };

  return { generate, regenerate, isGenerating, isRegenerating, result, setResult };
}
