'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Save, BarChart3, Zap, FileText, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { profileService, dashboardService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { DashboardStats } from '@/types';
import { formatDate } from '@/utils';
import toast from 'react-hot-toast';

const BUSINESS_TYPES = [
  'Restaurant', 'Retail Store', 'Medical Clinic', 'Law Firm', 'Auto Repair',
  'Beauty Salon', 'Fitness Studio', 'Real Estate Agency', 'Dental Office',
  'Plumbing Service', 'Electrical Service', 'Landscaping', 'Accounting Firm',
  'Photography Studio', 'Pet Grooming', 'Childcare / Daycare', 'Other'
];

type EmailStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export default function ProfilePage() {
  const { user, profile, setProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    business_type: '',
  });
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Email verification state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
      });
      if (profile.business_type) {
        const isKnown = BUSINESS_TYPES.includes(profile.business_type);
        if (isKnown) {
          setSelectedBusinessType(profile.business_type);
        } else if (profile.business_type) {
          setSelectedBusinessType('Other');
          setCustomBusinessType(profile.business_type);
        }
      }
    }
    if (user?.email) setEmail(user.email);
  }, [profile, user]);

  useEffect(() => {
    dashboardService.stats().then(res => { if (res.success && res.data) setStats(res.data); });
  }, []);

  // Sync business_type
  useEffect(() => {
    if (selectedBusinessType === 'Other') {
      setForm(f => ({ ...f, business_type: customBusinessType.trim() }));
    } else {
      setForm(f => ({ ...f, business_type: selectedBusinessType }));
    }
  }, [selectedBusinessType, customBusinessType]);

  // Email validation with debounce
  const validateEmail = (value: string) => {
    if (emailCheckTimeout) clearTimeout(emailCheckTimeout);

    setEmail(value);

    if (!value) {
      setEmailStatus('idle');
      setEmailMessage('');
      return;
    }

    // Basic format check immediately
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailStatus('invalid');
      setEmailMessage('Invalid email format');
      return;
    }

    // Check if domain has valid TLD (simulated MX check)
    setEmailStatus('checking');
    setEmailMessage('Checking email…');

    const timeout = setTimeout(async () => {
      try {
        // Check common disposable/invalid domains
        const domain = value.split('@')[1].toLowerCase();
        const disposableDomains = [
          'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
          'fakeinbox.com', 'sharklasers.com', 'yopmail.com', 'trashmail.com',
          'dispostable.com', 'mailnull.com', 'spamgourmet.com', 'spam4.me'
        ];

        if (disposableDomains.includes(domain)) {
          setEmailStatus('invalid');
          setEmailMessage('Disposable email addresses are not allowed');
          return;
        }

        // Check domain has valid structure (at least one dot after @)
        const domainParts = domain.split('.');
        if (domainParts.length < 2 || domainParts.some(p => p.length === 0)) {
          setEmailStatus('invalid');
          setEmailMessage('Email domain appears invalid');
          return;
        }

        // Check TLD length (1-6 chars is reasonable)
        const tld = domainParts[domainParts.length - 1];
        if (tld.length < 2 || tld.length > 6) {
          setEmailStatus('invalid');
          setEmailMessage('Invalid email domain extension');
          return;
        }

        // All checks passed
        setEmailStatus('valid');
        setEmailMessage('Email format looks valid');
      } catch {
        setEmailStatus('valid');
        setEmailMessage('Email format looks valid');
      }
    }, 600);

    setEmailCheckTimeout(timeout);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedBusinessType === 'Other' && !customBusinessType.trim()) {
      toast.error('Please describe your business type.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await profileService.update(form);
      if (res.success && res.data) {
        setProfile(res.data);
        toast.success('Profile updated! Generator will now use your business info.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">Your business info is used to pre-fill the content generator.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Profile form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Avatar & account info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white text-2xl font-display font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-display font-semibold text-slate-900 text-lg">
                  {profile?.full_name || 'Your Name'}
                </p>
                <p className="text-slate-500 text-sm">{user?.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Member since {profile?.created_at ? formatDate(profile.created_at) : '—'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className={`${inputCls} pl-9`}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Email verification */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                  <span className="ml-2 text-xs text-slate-400 font-normal">(display only)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                    {emailStatus === 'checking' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : emailStatus === 'valid' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : emailStatus === 'invalid' ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => validateEmail(e.target.value)}
                    className={`${inputCls} pl-9 pr-4 ${
                      emailStatus === 'invalid'
                        ? 'border-red-300 bg-red-50/30 focus:ring-red-500/20 focus:border-red-400'
                        : emailStatus === 'valid'
                        ? 'border-emerald-300 bg-emerald-50/20 focus:ring-emerald-500/20 focus:border-emerald-400'
                        : ''
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {emailMessage && (
                  <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                    emailStatus === 'valid' ? 'text-emerald-600' :
                    emailStatus === 'invalid' ? 'text-red-500' :
                    'text-slate-400'
                  }`}>
                    {emailStatus === 'valid' && <Check className="w-3 h-3" />}
                    {emailStatus === 'invalid' && <X className="w-3 h-3" />}
                    {emailMessage}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  To change your email address, contact support.
                </p>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Business Name
                  <span className="ml-2 text-xs text-indigo-500 font-normal">↳ auto-fills generator</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.business_name}
                    onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                    className={`${inputCls} pl-9`}
                    placeholder="Your business name"
                  />
                </div>
              </div>

              {/* Business Type with Other support */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Business Type
                  <span className="ml-2 text-xs text-indigo-500 font-normal">↳ auto-fills generator</span>
                </label>
                <select
                  value={selectedBusinessType}
                  onChange={e => {
                    setSelectedBusinessType(e.target.value);
                    if (e.target.value !== 'Other') setCustomBusinessType('');
                  }}
                  className={inputCls}
                >
                  <option value="">Select business type…</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                {selectedBusinessType === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3"
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Describe your business type <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={customBusinessType}
                      onChange={e => setCustomBusinessType(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Travel Agency, Event Management, Consulting…"
                      autoFocus
                    />
                    {customBusinessType && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Will be saved as: &quot;{customBusinessType}&quot;
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              <button type="submit" disabled={isSaving} className="btn-primary">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </span>
                ) : (
                  <><Save className="w-4 h-4" /> Save Profile</>
                )}
              </button>
            </form>
          </div>

          {/* Generator pre-fill preview */}
          {(form.business_name || form.business_type) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-50 rounded-2xl border border-indigo-200 p-5"
            >
              <p className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Generator will be pre-filled with:
              </p>
              <div className="space-y-2">
                {form.business_name && (
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Business name: <span className="font-semibold">{form.business_name}</span>
                  </div>
                )}
                {form.business_type && (
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Business type: <span className="font-semibold">{form.business_type}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats sidebar */}
        <div className="space-y-5">
          {/* Credits */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-indigo-200" />
              <span className="text-sm font-semibold text-indigo-100">Credits</span>
            </div>
            <div className="text-4xl font-display font-bold mb-1">{profile?.credits ?? 0}</div>
            <p className="text-indigo-200 text-sm">available</p>
            <div className="mt-4 h-2 bg-indigo-500/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((profile?.credits ?? 0) / 50) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-indigo-300 mt-2">Free plan: 50 credits</p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-display font-semibold text-slate-900 text-sm">Your Stats</h3>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4 text-slate-400" /> Total Generated
              </div>
              <span className="font-display font-bold text-slate-900">{stats?.total_generated ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BarChart3 className="w-4 h-4 text-slate-400" /> Avg SEO Score
              </div>
              <span className="font-display font-bold text-emerald-600">
                {stats?.avg_seo_score ? `${stats.avg_seo_score}%` : '—'}
              </span>
            </div>
          </div>

          {/* Quick tip */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">💡 Pro tip</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              Save your business name and type here and they will automatically appear in the Generator — no need to type them every time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
