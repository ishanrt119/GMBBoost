import supabaseAdmin from '../config/supabase';
import { Profile, GeneratedContent } from '../types';

// ── Profile helpers ──────────────────────────────────────────────────────────

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function createProfile(userId: string, _email: string): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      user_id: userId,
      credits: 50,
      credits_last_refill: new Date().toISOString(),
      plan: 'free',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'business_name' | 'business_type'>>
): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return data as Profile;
}

// Check if credits need monthly refill, then decrement
export async function decrementCredits(userId: string): Promise<void> {
  // First: check if monthly refill is due (fallback if cron missed)
  await checkAndRefillCredits(userId);

  // Re-fetch after potential refill
  const profile = await getProfileByUserId(userId);
  if (!profile) throw new Error('Profile not found');
  if (profile.credits <= 0) {
    throw new Error('No credits remaining. Your credits refill monthly — check back next month or upgrade your plan.');
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ credits: profile.credits - 1 })
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to decrement credits: ${error.message}`);
}

// Check if 30 days have passed and refill if so
export async function checkAndRefillCredits(userId: string): Promise<boolean> {
  const profile = await getProfileByUserId(userId);
  if (!profile) return false;

  const lastRefill = profile.credits_last_refill
    ? new Date(profile.credits_last_refill)
    : new Date(0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (lastRefill < thirtyDaysAgo) {
    const freeCredits = 50;
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        credits: freeCredits,
        credits_last_refill: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (!error) {
      console.log(`Credits refilled for user ${userId}`);
      return true;
    }
  }
  return false;
}

// ── Content helpers ──────────────────────────────────────────────────────────

export async function saveGeneratedContent(
  userId: string,
  data: Omit<GeneratedContent, 'id' | 'user_id' | 'created_at'>
): Promise<GeneratedContent> {
  const { data: content, error } = await supabaseAdmin
    .from('generated_content')
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(`Failed to save content: ${error.message}`);
  return content as GeneratedContent;
}

export async function getContentHistory(
  userId: string,
  options: { page?: number; limit?: number; content_type?: string; tone?: string; search?: string } = {}
): Promise<{ data: GeneratedContent[]; count: number }> {
  const { page = 1, limit = 10, content_type, tone, search } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('generated_content')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (content_type) query = query.eq('content_type', content_type);
  if (tone) query = query.eq('tone', tone);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch history: ${error.message}`);
  return { data: (data as GeneratedContent[]) || [], count: count || 0 };
}

export async function deleteContent(id: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('generated_content')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to delete content: ${error.message}`);
}

export async function getDashboardStats(userId: string) {
  // Check and refill credits if due before fetching stats
  await checkAndRefillCredits(userId);

  const [statsResult, recentResult, profileResult] = await Promise.all([
    supabaseAdmin
      .from('generated_content')
      .select('seo_score')
      .eq('user_id', userId),
    supabaseAdmin
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    getProfileByUserId(userId),
  ]);

  const allContent = statsResult.data || [];
  const avgSeoScore =
    allContent.length > 0
      ? Math.round(allContent.reduce((sum, c) => sum + (c.seo_score || 0), 0) / allContent.length)
      : 0;

  return {
    total_generated: allContent.length,
    avg_seo_score: avgSeoScore,
    credits_remaining: profileResult?.credits ?? 0,
    credits_last_refill: profileResult?.credits_last_refill ?? null,
    recent_content: recentResult.data || [],
  };
}
