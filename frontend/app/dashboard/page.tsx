'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Review {
  id: number;
  reviewerName: string;
  rating: number;
  reviewText: string;
  aiReply: string | null;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchReviews(parsedUser.id);
    }
  }, []);

  const fetchReviews = async (userId: number) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews?userId=${userId}`);
      setReviews(res.data);
    } catch (error) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: number) => {
    try {
      await axios.post(`http://localhost:5000/api/reviews/${id}/approve`);
      if (user) fetchReviews(user.id);
    } catch (error) {
      console.error('Failed to approve review');
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${id}`);
      if (user) fetchReviews(user.id);
    } catch (error) {
      console.error('Failed to delete review');
    }
  };

  const startEditing = (review: Review) => {
    setEditingId(review.id);
    setEditText(review.aiReply || '');
  };

  const saveEdit = async (id: number) => {
    try {
      await axios.put(`http://localhost:5000/api/reviews/${id}`, { aiReply: editText });
      setEditingId(null);
      if (user) fetchReviews(user.id);
    } catch (error) {
      console.error('Failed to update reply');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    if (status === 'approved') return '#10B981';
    if (status === 'pending') return '#F59E0B';
    if (status === 'reviewed') return '#7C3AED';
    if (status === 'published') return '#3B82F6';
    return '#64748B';
  };

  const renderStars = (rating: number) => '⭐'.repeat(rating);

  return (
    <main style={{ backgroundColor: '#F8F9FF', minHeight: '100vh', padding: '2rem' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2"
            style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Review Monitor
          </h1>
          <p style={{ color: '#64748B' }}>
            {user ? `Welcome, ${user.name} — ${user.business}` : 'Manage and approve AI-generated replies'}
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
          Logout
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Reviews', value: reviews.length },
          { label: 'Pending', value: reviews.filter(r => r.status === 'pending').length },
          { label: 'Approved', value: reviews.filter(r => r.status === 'approved').length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <p style={{ color: '#64748B' }} className="text-sm">{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: '#1E1B4B' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#64748B' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl p-8 text-center"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <p style={{ color: '#64748B' }}>No reviews yet!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl p-6"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: '#1E1B4B' }}>{review.reviewerName}</h3>
                  <span>{renderStars(review.rating)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: getStatusColor(review.status) + '20', color: getStatusColor(review.status) }}>
                    {review.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>

              <p className="mb-4" style={{ color: '#64748B' }}>{review.reviewText}</p>

              <div className="rounded-lg p-4 mb-4"
                style={{ backgroundColor: '#F8F9FF', border: '1px solid #7C3AED33' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#7C3AED' }}>AI REPLY</p>
                {editingId === review.id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg p-3 text-sm outline-none resize-none"
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#1E1B4B' }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(review.id)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)' }}>
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded-lg text-sm font-semibold"
                        style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: '#1E1B4B' }}>
                    {review.aiReply || 'No AI reply generated yet.'}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                {editingId !== review.id && (
                  <button
                    onClick={() => startEditing(review)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: '#F1F5F9', color: '#7C3AED', border: '1px solid #7C3AED33' }}>
                    ✏️ Edit Reply
                  </button>
                )}
                {review.status === 'pending' && editingId !== review.id && (
                  <button
                    onClick={() => approveReview(review.id)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)' }}>
                    ✅ Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}