import { ApiResponse, GenerateFormData, GeneratedContent, DashboardStats, Profile } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('AI Content Generator_token');
}

function clearSession() {
  localStorage.removeItem('AI Content Generator_token');
  localStorage.removeItem('AI Content Generator_user');
  localStorage.removeItem('AI Content Generator_profile');
}

function forceRedirect(path: string, reason: string) {
  clearSession();
  if (typeof window !== 'undefined') {
    window.location.href = `${path}?reason=${encodeURIComponent(reason)}`;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (res.status === 401) {
    if (data.code === 'USER_NOT_FOUND') {
      forceRedirect('/signup', data.message || 'Account not found. Please create a new account.');
      throw new Error(data.message);
    }
    if (data.code === 'INVALID_TOKEN' || data.code === 'NO_TOKEN' || data.code === 'AUTH_ERROR') {
      forceRedirect('/login', data.message || 'Session expired. Please log in again.');
      throw new Error(data.message);
    }
  }

  if (!res.ok && !data.success) {
    const error = new Error(data.message || 'Request failed') as Error & { code?: string };
    error.code = data.code;
    throw error;
  }

  return data;
}

export const authService = {
  signup: (email: string, password: string, fullName?: string) =>
    request<{ token: string; user: { id: string; email: string }; profile: Profile; needsVerification: boolean }>(
      '/auth/signup',
      { method: 'POST', body: JSON.stringify({ email, password, full_name: fullName }) }
    ),

  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string }; profile: Profile; needsVerification: boolean }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  googleCallback: (access_token: string) =>
    request<{ token: string; user: { id: string; email: string }; profile: Profile; needsVerification: boolean }>(
      '/auth/google/callback',
      { method: 'POST', body: JSON.stringify({ access_token }) }
    ),

  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const contentService = {
  generate: (data: GenerateFormData) =>
    request<GeneratedContent>('/content/generate', { method: 'POST', body: JSON.stringify(data) }),
  regenerate: (data: GenerateFormData) =>
    request<GeneratedContent>('/content/regenerate', { method: 'POST', body: JSON.stringify(data) }),
  history: (params: { page?: number; limit?: number; content_type?: string; tone?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') searchParams.set(k, String(v)); });
    return request<GeneratedContent[]>(`/content/history?${searchParams.toString()}`);
  },
  delete: (id: string) => request(`/content/delete/${id}`, { method: 'DELETE' }),
};

export const dashboardService = { stats: () => request<DashboardStats>('/dashboard/stats') };

export const profileService = {
  get: () => request<Profile>('/profile'),
  update: (data: { full_name?: string; business_name?: string; business_type?: string }) =>
    request<Profile>('/profile/update', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (new_password: string) =>
    request('/profile/password', { method: 'PUT', body: JSON.stringify({ new_password }) }),
};

export const emailService = {
  verify: (email: string) =>
    request<{ valid: boolean; deliverable: boolean; disposable: boolean; reason: string }>(
      `/auth/verify-email?email=${encodeURIComponent(email)}`
    ),
};
