'use client';

import React, { useState, useEffect } from 'react';
import ReviewAnalyticsCards from './ReviewAnalyticsCards';
import ReviewFilterBar from './ReviewFilterBar';
import ReviewCard from './ReviewCard';
import ReviewPagination from './ReviewPagination';

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Server-side state
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch reviews whenever state changes
  useEffect(() => {
    fetchReviews();
  }, [activeFilter, activeSort, currentPage, limit]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?filter=${activeFilter}&sort=${activeSort}&page=${currentPage}&limit=${limit}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setTotalReviews(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dedicated sync function to hit GBP API
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/reviews/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics || null);
        // Refresh the current page view
        await fetchReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  // Load analytics once on mount
  useEffect(() => {
    const loadInitialAnalytics = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        if (data.success && data.reviewStats) {
          setAnalytics(data.reviewStats);
        }
      } catch (err) {}
    };
    loadInitialAnalytics();
  }, []);

  const handleGenerateReply = async (reviewId: string, tone: string) => {
    try {
      const res = await fetch('/api/reviews/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, tone })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, aiSuggestedReply: data.reply, replyTone: tone } : r));
      } else {
        alert('Failed to generate reply');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostReply = async (reviewId: string, replyText: string) => {
    try {
      // The backend should now push this to Google if connected!
      const res = await fetch('/api/reviews/post-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, replyText })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, replyStatus: 'POSTED', response: replyText } : r));
      } else {
        alert(data.error || 'Failed to post reply');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Reputation Agent</h1>
          <p className="text-slate-500 mt-1">Manage all your Google reviews using official Business Profile API access.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70"
        >
          {syncing ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          )}
          {syncing ? 'Syncing with Google...' : 'Sync Now'}
        </button>
      </div>

      {analytics && (
        <ReviewAnalyticsCards analytics={analytics} />
      )}

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[500px]">
        <ReviewFilterBar 
          activeFilter={activeFilter} 
          onFilterChange={(val) => { setActiveFilter(val); setCurrentPage(1); }} 
          activeSort={activeSort}
          onSortChange={(val) => { setActiveSort(val); setCurrentPage(1); }}
        />
        
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-medium animate-pulse">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 font-medium">No reviews found.</p>
              {activeFilter !== 'all' && (
                <button onClick={() => setActiveFilter('all')} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Filters</button>
              )}
            </div>
          ) : (
            <>
              {reviews.map(review => (
                <ReviewCard 
                  key={review._id} 
                  review={review} 
                  onGenerateReply={handleGenerateReply}
                  onPostReply={handlePostReply}
                />
              ))}
              
              <ReviewPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                limit={limit}
                total={totalReviews}
                onPageChange={setCurrentPage}
                onLimitChange={(l) => { setLimit(l); setCurrentPage(1); }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
