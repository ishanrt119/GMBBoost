'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Check, X, Loader2, User, AlertCircle, UserX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { emailService } from '@/services/api';
import toast from 'react-hot-toast';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

type EmailStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export default function SignupPage() {
  const { signup, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const [activeTab, setActiveTab] = useState<'google' | 'email'>('google');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard');
  }, [user, isLoading, router]);

  // Live email verification
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!form.email) { setEmailStatus('idle'); setEmailMessage(''); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailStatus('invalid');
      setEmailMessage('Invalid email format');
      return;
    }

    setEmailStatus('checking');
    setEmailMessage('Verifying…');

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await emailService.verify(form.email);
        if (res.success && res.data) {
          if (!res.data.valid || !res.data.deliverable) {
            setEmailStatus('invalid');
            setEmailMessage(res.data.reason || 'Email does not appear to be real');
          } else if (res.data.disposable) {
            setEmailStatus('invalid');
            setEmailMessage('Disposable emails are not allowed');
          } else {
            setEmailStatus('valid');
            setEmailMessage('Email verified');
          }
        }
      } catch { setEmailStatus('valid'); setEmailMessage(''); }
    }, 800);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.email]);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch (err) {
      setIsGoogleLoading(false);
      toast.error(err instanceof Error ? err.message : 'Google signup failed.');
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error('Please enter your full name.'); return; }
    if (!form.email.trim()) { toast.error('Please enter your email.'); return; }
    if (emailStatus === 'invalid') { toast.error('Please use a valid, real email address.'); return; }
    if (emailStatus === 'checking') { toast.error('Please wait for email verification.'); return; }
    if (!form.password) { toast.error('Please enter a password.'); return; }
    const failedRule = PASSWORD_RULES.find(r => !r.test(form.password));
    if (failedRule) { toast.error(failedRule.label); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }

    setIsSubmitting(true);
    try {
      const result = await signup(form.email, form.password, form.fullName);
      if (result.needsVerification) {
        router.push(`/auth/verify?email=${encodeURIComponent(form.email)}`);
      } else {
        toast.success('Account created! Welcome to AI Content Generator 🎉');
        router.push('/dashboard');
      }
    } catch (err) {
      const error = err as Error & { code?: string };
      const msg = error.message || 'Signup failed.';
      if (error.code === 'ACCOUNT_EXISTS' || msg.toLowerCase().includes('already')) {
        toast.error('Account exists. Redirecting to sign in…');
        setTimeout(() => router.push('/login'), 1500);
        return;
      }
      if (error.code === 'INVALID_EMAIL' || error.code === 'DISPOSABLE_EMAIL') {
        setEmailStatus('invalid');
        setEmailMessage(msg);
        toast.error(msg);
        return;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailBorderCls =
    emailStatus === 'invalid' ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' :
    emailStatus === 'valid'   ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/20' :
    'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/30';

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">AI Content Generator</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Your local SEO,<br />on autopilot.
          </h2>
          <p className="text-indigo-200 text-base mb-8 leading-relaxed">
            Join thousands of businesses generating better GMB content with AI.
          </p>
          <div className="space-y-3">
            {['50 free credits every month', 'Google OAuth or email signup', 'No credit card required'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-indigo-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-400 text-xs relative">© {new Date().getFullYear()} AI Content Generator.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-xl">AI Content Generator</span>
          </Link>

          {reason && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <UserX className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Account not found</p>
                <p className="text-xs text-red-600 mt-0.5">{decodeURIComponent(reason)}</p>
              </div>
            </motion.div>
          )}

          <div className="mb-7">
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm">50 free credits monthly. No card required.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {(['google', 'email'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}>
                  {tab === 'google' ? 'Google' : 'Email & Password'}
                </button>
              ))}
            </div>

            <div className="p-7">
              <AnimatePresence mode="wait">
                {activeTab === 'google' ? (
                  <motion.div key="google"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}>
                    <p className="text-sm text-slate-500 text-center mb-5">
                      Sign up instantly with your Google account. Email is pre-verified.
                    </p>
                    <button onClick={handleGoogleSignup} disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200
                                 bg-white text-slate-700 font-semibold text-sm hover:border-indigo-300 hover:bg-slate-50
                                 transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                      {isGoogleLoading ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      {isGoogleLoading ? 'Redirecting…' : 'Continue with Google'}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="email"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleEmailSignup} className="space-y-4">

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={form.fullName}
                          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                          placeholder="Jane Smith" autoComplete="name" />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          {emailStatus === 'checking' ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /> :
                           emailStatus === 'valid'    ? <Check className="w-4 h-4 text-emerald-500" /> :
                           emailStatus === 'invalid'  ? <X className="w-4 h-4 text-red-500" /> :
                           <Mail className="w-4 h-4 text-slate-400" />}
                        </div>
                        <input type="email" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all ${emailBorderCls}`}
                          placeholder="you@company.com" autoComplete="email" />
                      </div>
                      <AnimatePresence>
                        {emailMessage && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`text-xs mt-1.5 ${emailStatus === 'valid' ? 'text-emerald-600' : emailStatus === 'invalid' ? 'text-red-500' : 'text-slate-400'}`}>
                            {emailMessage}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={showPw ? 'text' : 'password'} value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                          placeholder="Create a strong password" autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {form.password && (
                        <div className="mt-2 space-y-1">
                          {PASSWORD_RULES.map(rule => (
                            <div key={rule.label}
                              className={`flex items-center gap-1.5 text-xs transition-colors ${rule.test(form.password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                              <Check className="w-3 h-3" />{rule.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={showPw ? 'text' : 'password'} value={form.confirmPassword}
                          onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                          placeholder="Repeat your password" autoComplete="new-password" />
                      </div>
                      {form.confirmPassword && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${form.password === form.confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                          {form.password === form.confirmPassword
                            ? <><Check className="w-3 h-3" />Passwords match</>
                            : <><X className="w-3 h-3" />Passwords do not match</>}
                        </p>
                      )}
                    </div>

                    <button type="submit"
                      disabled={isSubmitting || emailStatus === 'checking' || emailStatus === 'invalid'}
                      className="btn-primary w-full py-3">
                      {isSubmitting ? (
                        <span className="flex items-center gap-2 justify-center">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Creating account…
                        </span>
                      ) : <>Create account <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
