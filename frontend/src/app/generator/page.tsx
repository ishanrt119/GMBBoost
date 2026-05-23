'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, RefreshCw, Copy, Check, X, Plus,
  Sparkles, MapPin, Building2, Tag, MessageSquare, FileText
} from 'lucide-react';
import { GenerateFormData, GeneratedContent, ToneType, ContentType } from '@/types';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatContentType, formatTone } from '@/utils';
import toast from 'react-hot-toast';

const TONES: ToneType[] = ['professional', 'friendly', 'casual', 'authoritative', 'enthusiastic'];
const CONTENT_TYPES: { value: ContentType; label: string; desc: string }[] = [
  { value: 'gmb_post', label: 'GMB Post', desc: 'Google Business Profile update post' },
  { value: 'seo_description', label: 'SEO Description', desc: 'Optimized business description' },
  { value: 'faq', label: 'FAQ', desc: 'Frequently asked questions' },
  { value: 'promotional', label: 'Promotional', desc: 'Offer or promotion post' },
  { value: 'educational', label: 'Educational', desc: 'Tips and how-it-works content' },
];

const BUSINESS_TYPES = [
  'Restaurant', 'Retail Store', 'Medical Clinic', 'Law Firm', 'Auto Repair',
  'Beauty Salon', 'Fitness Studio', 'Real Estate Agency', 'Dental Office',
  'Plumbing Service', 'Electrical Service', 'Landscaping', 'Accounting Firm',
  'Photography Studio', 'Pet Grooming', 'Childcare / Daycare', 'Other'
];

const DEFAULT_FORM: GenerateFormData = {
  business_name: '',
  business_type: '',
  location: '',
  keywords: [],
  tone: 'professional',
  content_type: 'gmb_post',
};

export default function GeneratorPage() {
  const { profile } = useAuth();
  const [form, setForm] = useState<GenerateFormData>(DEFAULT_FORM);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof GenerateFormData | 'business_type_custom', string>>>({});
  const { generate, regenerate, isGenerating, isRegenerating, result } = useContentGeneration();
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        business_name: profile.business_name || f.business_name,
        location: f.location,
      }));
      if (profile.business_type) {
        const isKnown = BUSINESS_TYPES.includes(profile.business_type);
        if (isKnown) {
          setSelectedBusinessType(profile.business_type);
          setForm(f => ({ ...f, business_type: profile.business_type || '' }));
        } else {
          setSelectedBusinessType('Other');
          setCustomBusinessType(profile.business_type);
          setForm(f => ({ ...f, business_type: profile.business_type || '' }));
        }
      }
    }
  }, [profile]);

  // Sync business_type in form when dropdown or custom input changes
  useEffect(() => {
    if (selectedBusinessType === 'Other') {
      setForm(f => ({ ...f, business_type: customBusinessType.trim() }));
    } else {
      setForm(f => ({ ...f, business_type: selectedBusinessType }));
    }
  }, [selectedBusinessType, customBusinessType]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.business_name.trim()) e.business_name = 'Business name is required';
    if (!form.business_type.trim()) {
      if (selectedBusinessType === 'Other') {
        e.business_type_custom = 'Please describe your business type';
      } else {
        e.business_type = 'Business type is required';
      }
    }
    if (!form.location.trim()) e.location = 'Location is required';
    if (form.keywords.length === 0) e.keywords = 'Add at least one keyword';
    if (form.keywords.length > 10) e.keywords = 'Maximum 10 keywords';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (!kw) return;
    if (form.keywords.includes(kw)) { toast.error('Duplicate keyword'); return; }
    if (form.keywords.length >= 10) { toast.error('Maximum 10 keywords'); return; }
    if (kw.length > 50) { toast.error('Keyword too long'); return; }
    setForm(f => ({ ...f, keywords: [...f.keywords, kw] }));
    setKeywordInput('');
    setErrors(e => ({ ...e, keywords: undefined }));
  };

  const removeKeyword = (kw: string) => setForm(f => ({ ...f, keywords: f.keywords.filter(k => k !== kw) }));

  const handleGenerate = async () => {
    if (!validate()) return;
    const res = await generate(form);
    if (res) setEditableContent(res.content);
  };

  const handleRegenerate = async () => {
    if (!validate()) return;
    const res = await regenerate(form);
    if (res) setEditableContent(res.content);
  };

  const handleCopy = () => {
    const text = editableContent || result?.content || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = (hasError?: string) => cn(
    'w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-sm transition-all',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400',
    hasError ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-slate-900">AI Content Generator</h1>
        <p className="text-slate-500 mt-1">Fill in your business details and generate optimized GMB content instantly.</p>
      </div>

      {/* Profile pre-fill notice */}
      {profile?.business_name && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>Pre-filled from your profile. You can edit any field before generating.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-7">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Business Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h2 className="font-display font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> Business Details
            </h2>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
              <input
                value={form.business_name}
                onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                className={inputCls(errors.business_name)}
                placeholder="e.g. Joe's Pizza Palace"
              />
              {errors.business_name && <p className="text-xs text-red-500 mt-1">{errors.business_name}</p>}
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Type</label>
              <select
                value={selectedBusinessType}
                onChange={e => {
                  setSelectedBusinessType(e.target.value);
                  if (e.target.value !== 'Other') setCustomBusinessType('');
                  setErrors(er => ({ ...er, business_type: undefined, business_type_custom: undefined }));
                }}
                className={inputCls(errors.business_type)}
              >
                <option value="">Select business type…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.business_type && <p className="text-xs text-red-500 mt-1">{errors.business_type}</p>}

              {/* Custom business type input when "Other" is selected */}
              <AnimatePresence>
                {selectedBusinessType === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 overflow-hidden"
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Describe your business type <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={customBusinessType}
                      onChange={e => {
                        setCustomBusinessType(e.target.value);
                        setErrors(er => ({ ...er, business_type_custom: undefined }));
                      }}
                      className={inputCls(errors.business_type_custom)}
                      placeholder="e.g. Travel Agency, Event Management…"
                      autoFocus
                    />
                    {errors.business_type_custom && (
                      <p className="text-xs text-red-500 mt-1">{errors.business_type_custom}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className={cn(inputCls(errors.location), 'pl-9')}
                  placeholder="e.g. Brooklyn, New York"
                />
              </div>
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-display font-semibold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" /> Keywords
            </h2>
            <div>
              <div className="flex gap-2">
                <input
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className={inputCls(errors.keywords)}
                  placeholder="Add keyword and press Enter"
                />
                <button onClick={addKeyword} type="button"
                  className="px-3 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.keywords && <p className="text-xs text-red-500 mt-1">{errors.keywords}</p>}
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.keywords.map(kw => (
                    <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2">{form.keywords.length}/10 keywords</p>
            </div>
          </div>

          {/* Style */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h2 className="font-display font-semibold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Style
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tone: t }))}
                    className={cn('px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left',
                      form.tone === t
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300')}>
                    {formatTone(t)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Content Type</label>
              <div className="space-y-2">
                {CONTENT_TYPES.map(({ value, label, desc }) => (
                  <button key={value} type="button" onClick={() => setForm(f => ({ ...f, content_type: value }))}
                    className={cn('w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                      form.content_type === value
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')}>
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">{label}</div>
                      <div className="text-xs opacity-70">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleGenerate} disabled={isGenerating || isRegenerating} className="btn-primary flex-1 py-3">
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating…
                </span>
              ) : (
                <><Wand2 className="w-4 h-4" /> Generate</>
              )}
            </button>
            {result && (
              <button onClick={handleRegenerate} disabled={isGenerating || isRegenerating} className="btn-secondary px-4 py-3">
                {isRegenerating ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!result && !isGenerating ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mb-5">
                  <Sparkles className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">Ready to generate</h3>
                <p className="text-slate-400 text-sm max-w-xs">Fill in your business details and click Generate to create AI-powered GMB content.</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-200">
                  <Wand2 className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">Generating content…</h3>
                <p className="text-slate-400 text-sm max-w-xs">Our AI is crafting SEO-optimized content tailored to your business.</p>
                <div className="flex gap-1.5 mt-6">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-slate-900">{result.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{formatContentType(result.content_type)} · {formatTone(result.tone)}</p>
                  </div>
                  <div className={cn('seo-badge', result.seo_score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : result.seo_score >= 60 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700')}>
                    SEO {result.seo_score}
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Content</label>
                    <textarea
                      value={editableContent || result.content}
                      onChange={e => setEditableContent(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Call to Action</label>
                    <div className="px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100 text-sm text-indigo-800 font-medium">{result.cta}</div>
                  </div>
                  {result.hashtags?.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Hashtags</label>
                      <div className="flex flex-wrap gap-2">
                        {result.hashtags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleCopy} className={cn('btn-primary flex-1', copied && 'bg-emerald-600 hover:bg-emerald-700')}>
                      {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Content</>}
                    </button>
                    <button onClick={handleRegenerate} disabled={isRegenerating} className="btn-secondary px-4">
                      <RefreshCw className={cn('w-4 h-4', isRegenerating && 'animate-spin')} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
