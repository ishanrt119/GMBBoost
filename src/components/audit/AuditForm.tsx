'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBusiness } from '@/context/BusinessContext';
import { Building2, MapPin } from 'lucide-react';

export default function AuditForm() {
  const router = useRouter();
  const { activeBusiness, loading: contextLoading } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness?._id) {
      setError('No active business selected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: activeBusiness._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate audit');
      }

      // Redirect to the loading/results page
      router.push(`/dashboard/audit/${data.auditId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Run an AI Audit</h2>
        <p className="text-slate-500">Generate a comprehensive, enterprise-grade analysis of your local presence.</p>
      </div>

      <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Target Business</h3>
        
        {activeBusiness ? (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">{activeBusiness.name}</h4>
              <p className="text-slate-500 flex items-center gap-1 mt-1 text-sm">
                <MapPin className="w-4 h-4" />
                {activeBusiness.address || 'Address not provided'}
              </p>
              {!activeBusiness.googleConnected && (
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Google Profile Not Connected
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 py-4">
            No business connected. Please complete onboarding.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !activeBusiness}
          className={`w-full py-4 px-4 rounded-xl text-white font-semibold text-lg transition-all ${
            loading || !activeBusiness 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gathering Intelligence...
            </span>
          ) : (
            'Generate Enterprise Audit'
          )}
        </button>
      </form>
    </motion.div>
  );
}
