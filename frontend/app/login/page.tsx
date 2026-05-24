'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
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
          Sign in to your account
        </p>

        {error && (
          <div className="rounded-lg p-3 mb-4 text-sm"
            style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
            {error}
          </div>
        )}

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

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" style={{ color: '#1E1B4B' }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid #E2E8F0', outline: 'none' }}
            placeholder="Enter your password"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-white mb-4"
          style={{ background: 'linear-gradient(to right, #7C3AED, #3B82F6)' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm" style={{ color: '#64748B' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#7C3AED', fontWeight: '600' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}