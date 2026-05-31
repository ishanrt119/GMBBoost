'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Building2,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface AdminStats {
  stats: {
    totalUsers: number;
    totalBusinesses: number;
    totalContentGenerated: number;
    newUsersLast7Days: number;
    newBusinessesLast7Days: number;
  };
  recentSignups: Array<{
    _id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
    subscriptionPlan?: string;
  }>;
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {sub && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-3 h-3" />
            {sub}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm font-medium text-slate-500">{title}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data);
        } else if (json.error?.includes('Unauthorized') || json.error?.includes('Forbidden')) {
          router.push('/admin/login');
        } else {
          setError(json.error || 'Failed to load');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="mt-4 text-sm text-violet-600 hover:underline font-medium"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentSignups } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-600/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Platform overview — real-time data</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          sub={`+${stats.newUsersLast7Days} this week`}
          icon={Users}
          color="bg-indigo-600"
        />
        <StatCard
          title="Total Businesses"
          value={stats.totalBusinesses}
          sub={`+${stats.newBusinessesLast7Days} this week`}
          icon={Building2}
          color="bg-violet-600"
        />
        <StatCard
          title="Content Generated"
          value={stats.totalContentGenerated}
          icon={Sparkles}
          color="bg-cyan-600"
        />
        <StatCard
          title="New Signups (7d)"
          value={stats.newUsersLast7Days}
          icon={TrendingUp}
          color="bg-emerald-600"
        />
      </div>

      {/* Recent Signups Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Signups</h2>
          <span className="text-xs font-medium text-slate-400">Latest 10 users</span>
        </div>

        {recentSignups.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSignups.map((user, idx) => (
                  <tr
                    key={user._id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.subscriptionPlan || 'Free'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
