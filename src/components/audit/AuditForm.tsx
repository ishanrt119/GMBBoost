'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBusiness } from '@/context/BusinessContext';
import { Zap, AlertTriangle, CheckCircle2, Settings, Building2, MapPin, Tag, Globe, Phone, Map as MapIcon, Hash } from 'lucide-react';

export default function AuditForm() {
  const router = useRouter();
  const { activeBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getMissingFields = () => {
    if (!activeBusiness) return ['Business Selection'];
    const missing = [];
    if (activeBusiness._id === '60b9b3b3b3b3b3b3b3b3b3b3') missing.push('Real Business Profile (Currently using Fallback)');
    if (!activeBusiness.userDefinedCategory && !activeBusiness.category) missing.push('Business Category');
    return missing;
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

  if (!activeBusiness) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        Please select or create a business to run an audit.
      </div>
    );
  }

  const missingFields = getMissingFields();
  const isReady = missingFields.length === 0;

  // @ts-ignore - city/state might not be on the activeBusiness type directly but are in the DB. fallback to address.
  const locationStr = [activeBusiness.city, activeBusiness.state].filter(Boolean).join(', ');
  const displayLocation = locationStr || activeBusiness.address || 'Location hidden';

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
            <Zap size={32} className={isReady ? "text-blue-600" : "text-slate-400"} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Generate AI Audit</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Generate a comprehensive technical, SEO, and competitor analysis using your connected business profile.
          </p>
        </div>

        {isReady ? (
          <div className="bg-white rounded-xl mb-10 text-left border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-500" />
                Connected Business Profile
              </h3>
              <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready for Audit
              </span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Business Name
                </label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 font-medium truncate">
                  {activeBusiness.name}
                </div>
              </div>

              {/* Field 2: Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Category
                </label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 font-medium truncate">
                  {activeBusiness.userDefinedCategory || 'N/A'}
                </div>
              </div>

              {/* Field 3: Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 font-medium truncate">
                  {displayLocation}
                </div>
              </div>

              {/* Field 4: Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapIcon className="w-3.5 h-3.5" /> Full Address
                </label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 font-medium truncate">
                  {activeBusiness.address || 'N/A'}
                </div>
              </div>

              {/* Field 5: Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Website
                </label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 font-medium truncate">
                  {activeBusiness.website || 'N/A'}
                </div>
              </div>

              {/* Field 6: Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 font-medium truncate">
                  {activeBusiness.phone || 'N/A'}
                </div>
              </div>


            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center">
              This information is auto-filled from your onboarding profile. To make changes, visit Business Settings.
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-xl p-8 mb-10 text-left border border-amber-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  Please complete your business setup before generating an audit.
                </h3>
                <p className="text-amber-700 mb-5">
                  Your business profile is missing required information. We need this data to accurately evaluate your online presence.
                </p>
                
                <div className="bg-white/60 rounded-lg p-4 mb-6 border border-amber-200/50">
                  <p className="text-sm font-semibold text-amber-900 mb-2">Missing Information:</p>
                  <ul className="list-none space-y-2">
                    {missingFields.map(field => (
                      <li key={field} className="flex items-center gap-2 text-sm text-amber-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => router.push('/dashboard/business')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow flex items-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  Complete Setup
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3 text-left shadow-sm">
            <AlertTriangle className="w-6 h-6 shrink-0 text-red-500" />
            <div>
              <h4 className="font-semibold mb-1">Audit Failed</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={triggerAudit}
          disabled={loading || !isReady}
          className={`w-full py-5 px-6 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            loading || !isReady 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-xl hover:-translate-y-0.5'
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
              <Zap className="w-6 h-6" />
              Generate Audit
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
