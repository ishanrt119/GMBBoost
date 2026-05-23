export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  business_name: string | null;
  business_type: string | null;
  credits: number;
  credits_last_refill?: string | null;
  plan?: string;
  created_at: string;
}

export interface GeneratedContent {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  location: string;
  keywords: string[];
  tone: string;
  content_type: string;
  title: string;
  content: string;
  hashtags: string[];
  cta: string;
  seo_score: number;
  created_at: string;
}

export interface GenerateContentRequest {
  business_name: string;
  business_type: string;
  location: string;
  keywords: string[];
  tone: 'professional' | 'friendly' | 'casual' | 'authoritative' | 'enthusiastic';
  content_type: 'gmb_post' | 'seo_description' | 'faq' | 'promotional' | 'educational';
}

export interface AIContentResponse {
  title: string;
  content: string;
  hashtags: string[];
  cta: string;
  seo_score: number;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface DashboardStats {
  total_generated: number;
  avg_seo_score: number;
  credits_remaining: number;
  credits_last_refill?: string | null;
  recent_content: GeneratedContent[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}
