'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Zap, Clock, ArrowRight, TrendingUp, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { dashboardService } from '@/services/api';
import { DashboardStats, GeneratedContent } from '@/types';
import { formatDate, formatContentType, cn } from '@/utils';
import { useAuth } from '@/hooks/useAuth';

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-display font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="skeleton w-11 h-11 rounded-xl mb-4" />
      <div className="skeleton h-8 w-16 mb-2 rounded" />
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  );
}

function getNextRefillDate(lastRefill: string | null | undefined): string {
  if (!lastRefill) return 'Next month';
  const next = new Date(lastRefill);
  next.setDate(next.getDate() + 30);
  const now = new Date();
  const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Refilling soon';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.stats()
      .then((res) => { if (res.success && res.data) setStats(res.data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">
          {greeting()}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your content today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Generated" value={stats?.total_generated ?? 0} icon={FileText} color="bg-indigo-100 text-indigo-600" sub="all time" />
            <StatCard label="Avg SEO Score" value={stats?.avg_seo_score ? `${stats.avg_seo_score}%` : 'N/A'} icon={BarChart3} color="bg-emerald-100 text-emerald-600" sub="across all content" />
            <StatCard label="Credits Left" value={stats?.credits_remaining ?? 0} icon={Zap} color="bg-amber-100 text-amber-600" sub="monthly plan" />
            <StatCard
              label="Next Refill"
              value={getNextRefillDate(stats?.credits_last_refill)}
              icon={CalendarClock}
              color="bg-violet-100 text-violet-600"
              sub="credits reset monthly"
            />
          </>
        )}
      </div>

      {/* Credits refill banner */}
      {!isLoading && stats && stats.credits_remaining <= 10 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl"
        >
          <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {stats.credits_remaining === 0 ? 'No credits remaining' : `Only ${stats.credits_remaining} credits left`}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your credits refill automatically every 30 days. Next refill: {getNextRefillDate(stats.credits_last_refill)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Link href="/generator" className="group bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-display font-semibold text-lg mb-1">Generate Content</h3>
          <p className="text-indigo-200 text-sm mb-4">Create AI-powered GMB posts, descriptions & more</p>
          <div className="flex items-center gap-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            Start generating <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/history" className="group bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
            <Clock className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-display font-semibold text-lg text-slate-900 mb-1">Content History</h3>
          <p className="text-slate-500 text-sm mb-4">Browse and manage all your generated content</p>
          <div className="flex items-center gap-1 text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
            View history <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/profile" className="group bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
            <BarChart3 className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-display font-semibold text-lg text-slate-900 mb-1">Your Profile</h3>
          <p className="text-slate-500 text-sm mb-4">Update business info and view your stats</p>
          <div className="flex items-center gap-1 text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
            View profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-900">Recent Generations</h2>
          <Link href="/history" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
                <div className="skeleton h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        ) : !stats?.recent_content?.length ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700 mb-1">No content yet</p>
            <p className="text-sm text-slate-400 mb-4">Generate your first AI content to see it here.</p>
            <Link href="/generator" className="btn-primary text-sm px-5 py-2">
              Generate now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {stats.recent_content.map((item: GeneratedContent) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.business_name} · {formatContentType(item.content_type)} · {formatDate(item.created_at)}
                  </p>
                </div>
                <div className={cn('seo-badge', item.seo_score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : item.seo_score >= 60 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700')}>
                  {item.seo_score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
