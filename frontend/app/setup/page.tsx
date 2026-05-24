'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface BusinessResult {
  title: string;
  address: string;
  rating: number;
  dataId: string;
}

export default function Setup() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const searchBusiness = async () => {
    if (!businessName) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await axios.post('http://localhost:5000/api/business/search', { businessName });
      setResults(res.data);
    } catch (err: any) {
      setError('Business not found. Try a different name.');
    } finally {
      setLoading(false);
    }
  };

  const selectBusiness = async (business: BusinessResult) => {
    if (!user) return;
    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/business/save', {
        userId: user.id,
        dataId: business.dataId,
        businessName: business.title + ' - ' + business.address
      });
      const updatedUser = { ...user, business: business.title, dataId: business.dataId };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      router.push('/dashboard');
    } catch (err: any) {
      setError('Failed to save business. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F8F9FF', padding: '2rem' }}>
      <div className="rounded-2xl p-8 w-full max-w-lg"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <h1 className="text-3xl font-bold mb-2 text-center"
          style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Setup Your Business
        </h1>
        <p className="text-center mb-8 text-sm" style={{ color: '#64748B' }}>
          Search for your business on Google Maps
        </p>

        {error && (
          <div className="rounded-lg p-3 mb-4 text-sm"
            style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchBusiness()}
            className="flex-1 px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid #E2E8F0', outline: 'none' }}
            placeholder="e.g. Starbucks Times Square New York"
          />
          <button
            onClick={searchBusiness}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)' }}>
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="grid gap-3">
            <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
              Select your business:
            </p>
            {results.map((business, index) => (
              <div key={index}
                className="rounded-lg p-4 cursor-pointer"
                style={{ border: '1px solid #E2E8F0', backgroundColor: '#F8F9FF' }}
                onClick={() => selectBusiness(business)}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1E1B4B' }}>{business.title}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>{business.address}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>⭐ {business.rating}</span>
                  </div>
                </div>
                <button
                  disabled={saving}
                  className="mt-3 w-full py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)' }}>
                  {saving ? 'Saving...' : 'Select This Business'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}