'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Profile, AuthState } from '@/types';
import { authService } from '@/services/api';
import { supabase } from '@/lib/supabase';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<{ needsVerification: boolean }>;
  logout: () => Promise<void>;
  setProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const FALLBACK_PROFILE = (userId: string): Profile => ({
  id: '',
  user_id: userId,
  full_name: null,
  business_name: null,
  business_type: null,
  avatar_url: null,
  credits: 50,
  credits_last_refill: new Date().toISOString(),
  plan: 'free',
  created_at: new Date().toISOString(),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    token: null,
    isLoading: true,
  });

  const persistSession = useCallback((token: string, user: User, profile: Profile) => {
    localStorage.setItem('AI Content Generator_token', token);
    localStorage.setItem('AI Content Generator_user', JSON.stringify(user));
    localStorage.setItem('AI Content Generator_profile', JSON.stringify(profile));
    setState({ token, user, profile, isLoading: false });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('AI Content Generator_token');
    localStorage.removeItem('AI Content Generator_user');
    localStorage.removeItem('AI Content Generator_profile');
    setState({ user: null, profile: null, token: null, isLoading: false });
  }, []);

  // Exchange Supabase session → our backend JWT
  const exchangeSupabaseSession = useCallback(async (accessToken: string): Promise<void> => {
    try {
      const res = await authService.googleCallback(accessToken);
      if (res.success && res.data) {
        const profile = res.data.profile ?? FALLBACK_PROFILE(res.data.user.id);
        persistSession(res.data.token, res.data.user, profile);
      }
    } catch (err) {
      console.error('[Auth] Session exchange failed:', err);
      clearSession();
    }
  }, [persistSession, clearSession]);

  // ── Bootstrap: hydrate from localStorage + subscribe to Supabase auth changes ──
  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1. Try existing localStorage session
      try {
        const token = localStorage.getItem('AI Content Generator_token');
        const userRaw = localStorage.getItem('AI Content Generator_user');
        const profileRaw = localStorage.getItem('AI Content Generator_profile');
        if (token && userRaw && mounted) {
          setState({
            token,
            user: JSON.parse(userRaw),
            profile: profileRaw ? JSON.parse(profileRaw) : null,
            isLoading: false,
          });
          return;
        }
      } catch { /* ignore parse errors */ }

      // 2. Check for active Supabase session (covers OAuth redirect)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token && mounted) {
          await exchangeSupabaseSession(session.access_token);
          return;
        }
      } catch { /* ignore */ }

      if (mounted) setState(s => ({ ...s, isLoading: false }));
    }

    init();

    // 3. Subscribe to Supabase auth state changes
    // This fires immediately after Google OAuth redirect completes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.access_token) {
        // Only exchange if we don't already have a local session
        const existingToken = localStorage.getItem('AI Content Generator_token');
        if (!existingToken) {
          await exchangeSupabaseSession(session.access_token);
        }
      }

      if (event === 'SIGNED_OUT') {
        clearSession();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [exchangeSupabaseSession, clearSession]);

  // ── Email/password login ──────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    if (!res.success || !res.data) throw new Error(res.message || 'Login failed.');
    const profile = res.data.profile ?? FALLBACK_PROFILE(res.data.user.id);
    persistSession(res.data.token, res.data.user, profile);
  }, [persistSession]);

  // ── Email/password signup ─────────────────────────────────────────────────
  const signup = useCallback(async (email: string, password: string, fullName?: string) => {
    const res = await authService.signup(email, password, fullName);
    if (!res.success || !res.data) throw new Error(res.message || 'Signup failed.');

    // If email verification required, don't persist — wait for verification
    if (res.data.needsVerification) {
      return { needsVerification: true };
    }

    const profile = res.data.profile ?? FALLBACK_PROFILE(res.data.user.id);
    persistSession(res.data.token, res.data.user, profile);
    return { needsVerification: false };
  }, [persistSession]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    clearSession();
    window.location.href = '/';
  }, [clearSession]);

  const setProfile = useCallback((profile: Profile) => {
    localStorage.setItem('AI Content Generator_profile', JSON.stringify(profile));
    setState(s => ({ ...s, profile }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
