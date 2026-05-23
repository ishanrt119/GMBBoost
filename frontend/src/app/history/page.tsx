'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Search, Trash2, FileText, ChevronLeft, ChevronRight,
  X, Copy, Check, Filter
} from 'lucide-react';
import { contentService } from '@/services/api';
import { GeneratedContent } from '@/types';
import { formatDate, formatContentType, formatTone, cn, truncate } from '@/utils';
import toast from 'react-hot-toast';

const CONTENT_TYPES = ['', 'gmb_post', 'seo_description', 'faq', 'promotional', 'educational'];
const TONES = ['', 'professional', 'friendly', 'casual', 'authoritative', 'enthusiastic'];

export default function HistoryPage() {
  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);

  const [filters, setFilters] = useState({ search: '', content_type: '', tone: '', page: 1 });
  const LIMIT = 10;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await contentService.history({
        page: filters.page,
        limit: LIMIT,
        content_type: filters.content_type || undefined,
        tone: filters.tone || undefined,
        search: filters.search || undefined,
      });
      if (res.success) {
        setItems(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load history.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content?')) return;
    try {
      await contentService.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTotal((t) => t - 1);
      if (selected?.id === id) setSelected(null);
      toast.success('Deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-slate-900">Content History</h1>
        <p className="text-slate-500 mt-1">{total} pieces of content generated in total.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
              placeholder="Search by title…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          <select value={filters.content_type} onChange={(e) => setFilters(f => ({ ...f, content_type: e.target.value, page: 1 }))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white">
            <option value="">All types</option>
            {CONTENT_TYPES.slice(1).map(t => <option key={t} value={t}>{formatContentType(t)}</option>)}
          </select>

          <select value={filters.tone} onChange={(e) => setFilters(f => ({ ...f, tone: e.target.value, page: 1 }))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white">
            <option value="">All tones</option>
            {TONES.slice(1).map(t => <option key={t} value={t}>{formatTone(t)}</option>)}
          </select>

          {(filters.search || filters.content_type || filters.tone) && (
            <button onClick={() => setFilters({ search: '', content_type: '', tone: '', page: 1 })}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-5">
        {/* List */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="skeleton w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-slate-300" />
                </div>
                <p className="font-semibold text-slate-700 mb-1">No content found</p>
                <p className="text-sm text-slate-400">Try adjusting your filters or generate new content.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelected(item)}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4 cursor-pointer transition-all hover:bg-slate-50/60',
                      selected?.id === item.id && 'bg-indigo-50/50 border-r-2 border-indigo-500'
                    )}
                  >
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.business_name} · {formatContentType(item.content_type)} · {formatDate(item.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={cn('seo-badge', item.seo_score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : item.seo_score >= 60 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700')}>
                        {item.seo_score}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-slate-500">
                Showing {((filters.page - 1) * LIMIT) + 1}–{Math.min(filters.page * LIMIT, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  disabled={filters.page <= 1}
                  className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  disabled={filters.page >= totalPages}
                  className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="w-80 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit sticky top-8"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-display font-semibold text-slate-900 text-sm truncate flex-1">{selected.title}</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium border border-indigo-200">{formatContentType(selected.content_type)}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{formatTone(selected.tone)}</span>
                  <span className={cn('seo-badge', selected.seo_score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700')}>
                    SEO {selected.seo_score}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Content</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">CTA</p>
                  <p className="text-sm text-indigo-700 font-medium">{selected.cta}</p>
                </div>

                {selected.hashtags?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Hashtags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.hashtags.map(h => (
                        <span key={h} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">#{h}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleCopy(selected.content)} className="btn-primary flex-1 text-xs py-2">
                    {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                  </button>
                  <button onClick={() => handleDelete(selected.id)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
