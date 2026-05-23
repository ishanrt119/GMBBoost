'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    async function handleCallback() {
      try {
        // Supabase automatically parses the URL hash/code on this page
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw new Error(error.message);

        if (!session?.access_token) {
          // Try exchanging the code from URL params (PKCE flow)
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code) {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw new Error(exchangeError.message);
            if (data.session) {
              await finishLogin(data.session.access_token);
              return;
            }
          }
          throw new Error('No session found. Please try signing in again.');
        }

        await finishLogin(session.access_token);
      } catch (err) {
        console.error('[AuthCallback]', err);
        const msg = err instanceof Error ? err.message : 'Authentication failed.';
        toast.error(msg);
        router.replace(`/login?reason=${encodeURIComponent(msg)}`);
      }
    }

    async function finishLogin(accessToken: string) {
      const res = await authService.googleCallback(accessToken);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to complete login.');
      }

      localStorage.setItem('AI Content Generator_token', res.data.token);
      localStorage.setItem('AI Content Generator_user', JSON.stringify(res.data.user));
      localStorage.setItem('AI Content Generator_profile', JSON.stringify(res.data.profile));

      toast.success('Welcome to AI Content Generator! 🎉');
      router.replace('/dashboard');
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Signing you in…</h2>
        <p className="text-slate-400 text-sm">Setting up your account, please wait.</p>
        <div className="flex gap-1.5 justify-center mt-5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
