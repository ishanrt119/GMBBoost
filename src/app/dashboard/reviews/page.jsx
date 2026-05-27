'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Star, Loader2, Edit3, CheckCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([api.get('/reviews'), api.get('/reviews/analytics?businessId=6651234567890abcdef12345')]);
      setReviews(r.data.reviews || r.data || []);
      setStats(s.data.analytics || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerMonitor = async () => {
    const toastId = toast.loading('Polling for new reviews...');
    try {
      // Mocking a business ID, in real app it would come from context
      await api.post('/reviews/monitor?businessId=6651234567890abcdef12345');
      toast.success('Monitoring job completed!', { id: toastId });
      fetchData();
    } catch (err) {
      toast.error('Monitoring failed.', { id: toastId });
    }
  };

  const startEditing = (r) => {
    setEditingId(r._id || r.id);
    setEditText(r.aiSuggestedReply || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const approveReply = async (id, updatedText = null) => {
    const toastId = toast.loading('Approving reply...');
    try {
      await api.post(`/reviews/${id}/approve-reply`, { aiSuggestedReply: updatedText });
      toast.success('Reply approved! Ready to post.', { id: toastId });
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to approve reply.', { id: toastId });
    }
  };

  const postReply = async (id) => {
    const toastId = toast.loading('Posting reply to Google...');
    try {
      await api.post(`/reviews/${id}/post-reply`);
      toast.success('Reply posted successfully!', { id: toastId });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to post reply.', { id: toastId });
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Reviews Tracker</h1>
            <p className="text-slate-500">Monitor, edit, and approve AI replies for Google reviews</p>
          </div>
          <button onClick={triggerMonitor} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-sm">
            <RefreshCcw size={16} /> Poll New Reviews
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-slate-900">{stats?.totalReviews || reviews.length || 0}</div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Total Reviews</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-amber-500">{reviews.filter(r => r.replyStatus === 'PENDING').length}</div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Pending AI Replies</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-emerald-600">{reviews.filter(r => r.replyStatus === 'APPROVED').length}</div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Ready to Post</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm flex flex-col justify-center items-center">
                <div className="text-4xl font-black text-amber-500">{stats?.averageRating || 0}</div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Average Google Rating</div>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
              {reviews.map((r) => {
                const id = r._id || r.id;
                const isEditing = editingId === id;
                return (
                  <div key={id} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                          {r.reviewer || (r.customer ? `${r.customer.firstName} ${r.customer.lastName || ''}` : 'Unknown')}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-500 text-lg tracking-widest">{'★'.repeat(r.rating || 0)}</span>
                          <span className="text-xs text-slate-400 font-medium">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</span>
                          {r.sentiment && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${r.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600' : r.sentiment === 'negative' || r.sentiment === 'critical' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                              {r.sentiment}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${r.replyStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : r.replyStatus === 'POSTED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                          {r.replyStatus || 'PENDING'}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {r.reviewText || r.text || <span className="italic text-slate-400">No review text provided.</span>}
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-primary tracking-wide">AI SUGGESTED REPLY</p>
                      </div>

                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900 outline-none focus:border-primary transition-all resize-none shadow-sm"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={cancelEdit} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all shadow-sm">
                              Cancel
                            </button>
                            <button onClick={() => approveReply(id, editText)} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-sm">
                              Save & Approve
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {r.aiSuggestedReply || <span className="italic text-slate-400">No AI reply generated yet.</span>}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {r.replyStatus === 'PENDING' && (
                              <>
                                <button onClick={() => startEditing(r)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                                  <Edit3 size={14} /> Edit
                                </button>
                                <button onClick={() => approveReply(id)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                                  <CheckCircle size={14} /> Approve
                                </button>
                              </>
                            )}
                            {r.replyStatus === 'APPROVED' && (
                              <button onClick={() => postReply(id)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-sm">
                                Post to Google
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {!reviews.length && (
                <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-12 text-center text-slate-500 text-sm">
                  No reviews tracked yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}