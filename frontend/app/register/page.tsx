'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', business: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/setup');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F8F9FF' }}>
      <div className="rounded-2xl p-8 w-full max-w-md"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <h1 className="text-3xl font-bold mb-2 text-center"
          style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Review Monitor AI
        </h1>
        <p className="text-center mb-8 text-sm" style={{ color: '#64748B' }}>
          Create your account
        </p>

        {error && (
          <div className="rounded-lg p-3 mb-4 text-sm"
            style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: '#1E1B4B' }}>Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid #E2E8F0', outline: 'none' }}
            placeholder="Enter your full name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: '#1E1B4B' }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid #E2E8F0', outline: 'none' }}
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: '#1E1B4B' }}>Business Name</label>
          <input
            type="text"
            value={form.business}
            onChange={e => setForm({ ...form, business: e.target.value })}
            className="w-full px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid #E2E8F0', outline: 'none' }}
            placeholder="Enter your business name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" style={{ color: '#1E1B4B' }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid #E2E8F0', outline: 'none' }}
            placeholder="Create a password"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-white mb-4"
          style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-center text-sm" style={{ color: '#64748B' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#7C3AED', fontWeight: '600' }}>
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}