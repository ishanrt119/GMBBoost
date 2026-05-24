'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Star, Loader2 } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our new architecture we have /api/reviews and /api/reviews/analytics
    Promise.all([api.get('/reviews'), api.get('/reviews/analytics')])
      .then(([r, s]) => { 
        setReviews(r.data.reviews || r.data || []); 
        setStats(s.data.analytics || null); 
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full pb-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Reviews Tracker</h1>
          <p className="text-white/40">All collected Google reviews across campaigns</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="glass-dark border border-white/10 rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-white">{stats?.totalReviews || reviews.length || 0}</div>
                <div className="text-xs text-white/40 mt-2 font-medium">Total Reviews</div>
              </div>
              <div className="glass-dark border border-white/10 rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary">{stats?.totalRequests || 0}</div>
                <div className="text-xs text-white/40 mt-2 font-medium">Total Requests</div>
              </div>
              <div className="glass-dark border border-white/10 rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-400">{stats?.clickedRequests || 0}</div>
                <div className="text-xs text-white/40 mt-2 font-medium">Total Clicks</div>
              </div>
              
              {/* If we have specific breakdown we can show them, else show general stats */}
              <div className="glass-dark border border-white/10 rounded-2xl p-6 mb-4 flex flex-col justify-center items-center shadow-sm lg:col-span-3">
                <div className="text-5xl font-black text-yellow-500">{stats?.averageRating || 0}</div>
                <div className="text-yellow-500 text-lg mt-1 tracking-widest">
                  {'★'.repeat(Math.round(stats?.averageRating || 0))}
                </div>
                <div className="text-xs text-white/40 mt-2 font-medium">Average Google Rating</div>
              </div>
            </div>

            {/* Reviews table */}
            <div className="glass-dark border border-white/10 rounded-[24px] overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {['Customer', 'Rating', 'Review', 'Date', 'Status'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs text-white/60 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id || r.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-6 py-4 font-bold text-white">
                        {r.reviewer || (r.customer ? `${r.customer.firstName} ${r.customer.lastName || ''}` : 'Unknown')}
                      </td>
                      <td className="px-6 py-4 text-yellow-500 text-lg">
                        {'★'.repeat(r.rating || 0)}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm max-w-md truncate">
                        {r.reviewText || r.text || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-white/40 font-medium">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold">
                           LIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!reviews.length && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/40 text-sm">
                        No reviews tracked yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}