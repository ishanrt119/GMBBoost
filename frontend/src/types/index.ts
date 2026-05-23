export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  business_name: string | null;
  business_type: string | null;
  avatar_url?: string | null;
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

export interface GenerateFormData {
  business_name: string;
  business_type: string;
  location: string;
  keywords: string[];
  tone: ToneType;
  content_type: ContentType;
}

export type ToneType = 'professional' | 'friendly' | 'casual' | 'authoritative' | 'enthusiastic';
export type ContentType = 'gmb_post' | 'seo_description' | 'faq' | 'promotional' | 'educational';

export interface DashboardStats {
  total_generated: number;
  avg_seo_score: number;
  credits_remaining: number;
  credits_last_refill?: string | null;
  recent_content: GeneratedContent[];
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
  total?: number;
  code?: string;
}
