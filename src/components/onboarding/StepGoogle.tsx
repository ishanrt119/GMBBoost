import React, { useState, useEffect } from 'react';
import { OnboardingData } from './types';
import { ArrowRight, Star } from 'lucide-react';

interface Props {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepGoogle({ data, updateData, onNext, onBack }: Props) {
  const [error, setError] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setConnected(true);
        fetchLocations();
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setError('Google authentication failed. Please try again.');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const res = await fetch('/api/google/locations');
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations);
      } else {
        setError(data.error || 'Failed to fetch locations');
      }
    } catch (err) {
      setError('An error occurred while fetching locations');
    }
    setLoadingLocations(false);
  };

  const handleConnect = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      '/api/google/auth',
      'Google Auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleContinue = () => {
    onNext(); // Making this optional for smooth UX
  };

  return (
    <div className="h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 flex flex-col border border-slate-100">
      <div className="flex-1">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
          <Star className="text-blue-600 w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Connect Google Profile</h2>
        <p className="text-slate-500 mb-8">This helps our AI fetch your reviews and optimize your local SEO rankings automatically.</p>

        <div className="space-y-5">
          {!connected ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <p className="text-slate-600 mb-6 font-medium">To securely fetch all your reviews and reply to them, you must connect your Google Account.</p>
              <button 
                onClick={handleConnect}
                className="mx-auto flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-300 shadow-sm text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Connect Google Account
              </button>
              {error && <p className="text-red-500 text-sm font-bold mt-4">{error}</p>}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Google Connected Successfully!
              </h3>
              
              <label className="block text-sm font-bold text-slate-900 mb-2">Select Your Location / Business</label>
              {loadingLocations ? (
                <div className="text-slate-500 text-sm font-medium animate-pulse">Fetching your locations...</div>
              ) : locations.length > 0 ? (
                <select 
                  value={data.googleLocationId || ''}
                  onChange={(e) => {
                    const selected = locations.find(loc => loc.name === e.target.value);
                    if (selected) {
                      updateData({
                        googleLocationId: selected.name,
                        businessName: selected.title,
                        googleConnected: true
                      });
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                >
                  <option value="">Select a location</option>
                  {locations.map((loc: any) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.title} ({loc.storefrontAddress?.addressLines?.[0] || 'No Address'})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-red-500 text-sm font-medium">No locations found on this account.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-slate-100">
        <button onClick={onBack} className="text-slate-500 font-bold hover:text-slate-900 transition-colors px-4 py-2">
          Back
        </button>
        <button 
          onClick={handleContinue}
          className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
