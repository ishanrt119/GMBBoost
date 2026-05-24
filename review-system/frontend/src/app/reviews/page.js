 'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { Star, Loader2 } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/reviews'), api.get('/reviews/stats')])
      .then(([r, s]) => { setReviews(r.data.reviews); setStats(s.data.stats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Reviews Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">All collected Google reviews across campaigns</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-800">{stats?.total || 0}</div>
                <div className="text-xs text-gray-500 mt-1">Total</div>
              </div>
              {[5, 4, 3, 2, 1].map((r) => {
                const count = stats?.byRating?.find((b) => b.rating === r)?.count || 0;
                return (
                  <div key={r} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-yellow-500">{count}</div>
                    <div className="text-xs text-gray-500 mt-1">{'★'.repeat(r)}</div>
                  </div>
                );
              })}
            </div>

            {/* Average rating */}
            {stats?.avg && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-4 shadow-sm">
                <div className="text-4xl font-black text-yellow-500">{stats.avg}</div>
                <div>
                  <div className="text-yellow-500 text-xl">{'★'.repeat(Math.round(stats.avg))}</div>
                  <div className="text-xs text-gray-500">Average Google Rating</div>
                </div>
              </div>
            )}

            {/* Reviews table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Customer', 'Rating', 'Review', 'Channel', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {r.customer.firstName} {r.customer.lastName || ''}
                      </td>
                      <td className="px-4 py-3 text-yellow-500">
                        {'★'.repeat(r.review?.rating || 0)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {r.review?.text || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{r.channel}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                  {!reviews.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                        No reviews yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}