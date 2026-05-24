 'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { Users, Send, MousePointer, Star, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  QUEUED:   'bg-gray-100 text-gray-600',
  SENT:     'bg-blue-100 text-blue-700',
  CLICKED:  'bg-purple-100 text-purple-700',
  REVIEWED: 'bg-green-100 text-green-700',
  FAILED:   'bg-red-100 text-red-600',
};

export default function DashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const CARDS = [
    { label: 'Customers',     value: stats.customers || 0, icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Requests Sent', value: stats.sent      || 0, icon: Send,         color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Link Clicks',   value: stats.clicked   || 0, icon: MousePointer, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Reviews',       value: stats.reviewed  || 0, icon: Star,         color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Live review funnel performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {CARDS.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Funnel + channel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-sm mb-4 text-gray-800">Funnel Performance</h3>
                {[
                  { label: 'Sent',     value: stats.sent,     max: stats.sent, color: 'bg-blue-500' },
                  { label: 'Clicked',  value: stats.clicked,  max: stats.sent, color: 'bg-purple-500' },
                  { label: 'Reviewed', value: stats.reviewed, max: stats.sent, color: 'bg-green-500' },
                  { label: 'Failed',   value: stats.failed,   max: stats.sent, color: 'bg-red-400' },
                ].map(({ label, value, max, color }) => (
                  <div key={label} className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-gray-500 w-20">{label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`}
                        style={{ width: max ? `${Math.min(100, (value/max)*100)}%` : '0%' }} />
                    </div>
                    <span className="text-xs font-bold w-8 text-right text-gray-700">{value || 0}</span>
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-500">{stats.avgRating || '—'}</div>
                    <div className="text-[10px] text-gray-400">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800">
                      {stats.sent ? `${((stats.reviewed / stats.sent) * 100).toFixed(0)}%` : '—'}
                    </div>
                    <div className="text-[10px] text-gray-400">Conversion</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-sm mb-4 text-gray-800">By Channel</h3>
                {(data?.byChannel || []).map(({ channel, count }) => {
                  const total = data.byChannel.reduce((s, c) => s + c.count, 0) || 1;
                  const pct   = Math.round((count / total) * 100);
                  const info  = {
                    WHATSAPP: { color: 'bg-green-500', label: '💬 WhatsApp' },
                    EMAIL:    { color: 'bg-blue-500',  label: '📧 Email' },
                    SMS:      { color: 'bg-yellow-500',label: '📱 SMS' },
                  };
                  return (
                    <div key={channel} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{info[channel]?.label}</span>
                        <span className="font-bold text-gray-700">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${info[channel]?.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {!data?.byChannel?.length && (
                  <p className="text-xs text-gray-400">No channel data yet</p>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-sm mb-4 text-gray-800">Recent Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Customer', 'Channel', 'Campaign', 'Status', 'Rating'].map((h) => (
                        <th key={h} className="text-left pb-2 text-xs text-gray-500 font-medium pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recent || []).map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-2.5 pr-4 font-medium text-gray-800">{r.name}</td>
                        <td className="py-2.5 pr-4 text-gray-500 text-xs">{r.channel}</td>
                        <td className="py-2.5 pr-4 text-gray-500 text-xs truncate max-w-[120px]">{r.campaign}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || ''}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-yellow-500 text-sm">
                          {r.rating ? '★'.repeat(r.rating) : '—'}
                        </td>
                      </tr>
                    ))}
                    {!data?.recent?.length && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400 text-sm">
                          No data yet — launch a campaign first
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}