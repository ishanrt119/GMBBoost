'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface AutomationStats {
  totalRuns: number;
  successCount: number;
  failedCount: number;
  failedToday: number;
  successRate: number;
}

interface AutomationLog {
  _id: string;
  workflow?: string;
  action?: string;
  type?: string;
  status?: string;
  message?: string;
  error?: string;
  businessId?: string;
  createdAt: string;
  duration?: number;
}

interface AutomationsData {
  stats: AutomationStats;
  byWorkflow: Array<{ _id: string; count: number }>;
  recentLogs: AutomationLog[];
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  warning,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  warning?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-6 shadow-sm ${warning && Number(value) > 0 ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {warning && Number(value) > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
            <AlertTriangle className="w-3 h-3" /> Needs attention
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-slate-500">{title}</div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (status === 'success') {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
        <CheckCircle2 className="w-3 h-3" /> Success
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
        <XCircle className="w-3 h-3" /> Failed
      </span>
    );
  }
  return (
    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
      {status || '—'}
    </span>
  );
}

export default function AutomationsPage() {
  const [data, setData] = useState<AutomationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const res = await fetch(`/api/admin/automations?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch automations data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-violet-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Automations</h1>
            <p className="text-sm text-slate-500">Monitor all automation runs across the platform</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-all text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Runs"
              value={data.stats.totalRuns}
              icon={Zap}
              color="bg-violet-600"
            />
            <StatCard
              title="Success Rate"
              value={`${data.stats.successRate}%`}
              icon={CheckCircle2}
              color="bg-emerald-500"
            />
            <StatCard
              title="Total Failed"
              value={data.stats.failedCount}
              icon={XCircle}
              color="bg-red-500"
              warning
            />
            <StatCard
              title="Failed Today"
              value={data.stats.failedToday}
              icon={AlertTriangle}
              color="bg-amber-500"
              warning
            />
          </div>

          {/* Top Workflows */}
          {data.byWorkflow.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-slate-900 mb-4">Most Active Workflows</h2>
              <div className="space-y-3">
                {data.byWorkflow.map((w) => (
                  <div key={w._id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{w._id || 'Unknown'}</span>
                    <span className="text-sm font-bold text-violet-600">{w.count} runs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white"
            >
              <option value="all">All Types</option>
              <option value="scheduler">Scheduler</option>
              <option value="ai_generation">AI Generation</option>
              <option value="inngest_job">Inngest Job</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Automation Logs</h2>
              <p className="text-sm text-slate-500">Latest 50 automation runs</p>
            </div>
            {data.recentLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No automation logs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left p-4 text-slate-500 font-medium">Workflow</th>
                      <th className="text-left p-4 text-slate-500 font-medium">Action</th>
                      <th className="text-left p-4 text-slate-500 font-medium">Type</th>
                      <th className="text-left p-4 text-slate-500 font-medium">Status</th>
                      <th className="text-left p-4 text-slate-500 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLogs.map((log) => (
                      <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-700">{log.workflow || '—'}</td>
                        <td className="p-4 text-slate-600">{log.action || '—'}</td>
                        <td className="p-4 text-slate-500">{log.type || '—'}</td>
                        <td className="p-4"><StatusBadge status={log.status} /></td>
                        <td className="p-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}