'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '@/context/BusinessContext';
import { Zap, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export default function AuditForm() {
  const router = useRouter();
  const { activeBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMissingInfoPopup, setShowMissingInfoPopup] = useState(false);

  // For the popup form to collect missing info
  const [missingData, setMissingData] = useState({
    userDefinedCategory: '',
    googlePlaceId: ''
  });

  const validateBusiness = () => {
    if (!activeBusiness) {
      setError('No active business selected.');
      return false;
    }

    if (!activeBusiness.userDefinedCategory || !activeBusiness.googlePlaceId) {
      setMissingData({
        userDefinedCategory: activeBusiness.userDefinedCategory || '',
        googlePlaceId: activeBusiness.googlePlaceId || ''
      });
      setShowMissingInfoPopup(true);
      return false;
    }

    return true;
  };

  const handleUpdateMissingInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/business/${activeBusiness?._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missingData),
      });

      if (!res.ok) throw new Error('Failed to update business details.');
      
      // Need to force a reload or context update here, but for now we close and run audit
      setShowMissingInfoPopup(false);
      
      // Re-run the audit trigger directly since data is saved
      await triggerAudit();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const triggerAudit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: activeBusiness?._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate audit');
      }

      router.push(`/dashboard/audit/${data.auditId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (validateBusiness()) {
      await triggerAudit();
    }
  };

  if (!activeBusiness) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        Please select or create a business to run an audit.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center"
      >
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Zap size={32} />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Run AI Audit</h2>
        <p className="text-slate-500 mb-8 text-lg max-w-lg mx-auto">
          Generate a comprehensive technical, SEO, and competitor analysis for <span className="font-bold text-slate-700">{activeBusiness.name}</span>.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Business Context Loaded
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Business Name</p>
              <p className="font-medium text-slate-900 truncate">{activeBusiness.name}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Category</p>
              <p className="font-medium text-slate-900 truncate">{activeBusiness.userDefinedCategory || <span className="text-amber-500">Missing</span>}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500 mb-1">Google Place ID</p>
              <p className="font-medium text-slate-900 truncate font-mono text-xs">{activeBusiness.googlePlaceId || <span className="text-amber-500">Missing</span>}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Audit Engines...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generate Enterprise Audit
            </>
          )}
        </button>
      </motion.div>

      {/* Missing Info Popup */}
      <AnimatePresence>
        {showMissingInfoPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowMissingInfoPopup(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-xl font-bold">Missing Information</h3>
              </div>
              <p className="text-slate-500 mb-6 text-sm">
                To run a highly accurate audit, we need your Google Place ID and Business Category. This will only be asked once.
              </p>

              <form onSubmit={handleUpdateMissingInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Business Category</label>
                  <input
                    type="text"
                    required
                    value={missingData.userDefinedCategory}
                    onChange={(e) => setMissingData({...missingData, userDefinedCategory: e.target.value})}
                    placeholder="e.g. Plumber, University, Dentist"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">Used for competitor analysis and SEO.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Google Place ID</label>
                  <input
                    type="text"
                    required
                    value={missingData.googlePlaceId}
                    onChange={(e) => setMissingData({...missingData, googlePlaceId: e.target.value})}
                    placeholder="ChIJ..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 mt-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save & Run Audit'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
