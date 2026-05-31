import React, { useState, useEffect } from 'react';
import { OnboardingData } from './types';
import { ArrowRight, MapPin, Search, Loader2, Store, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function StepBusiness({ data, updateData, onNext, onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  // UI States
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [error, setError] = useState('');

  // Effect to fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/google/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
        const json = await res.json();
        if (json.success) {
          setSuggestions(json.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSelectBusiness = async (placeId: string, mainText: string) => {
    setShowDropdown(false);
    setSearchQuery(mainText);
    setIsFetchingDetails(true);
    setError('');

    try {
      const res = await fetch(`/api/google/place-details?placeId=${placeId}`);
      const json = await res.json();
      
      if (json.success && json.data) {
        const d = json.data;
        // Auto-generate the direct review link
        const generatedReviewLink = `https://search.google.com/local/writereview?placeid=${placeId}`;

        // Auto-fill everything
        updateData({
          businessName: d.name || mainText,
          address: d.formattedAddress || '',
          phone: d.phoneNumber || '',
          website: d.website || '',
          category: d.categories && d.categories.length > 0 ? d.categories[0].replace(/_/g, ' ') : '',
          googlePlaceId: placeId,
          googleMapsUrl: d.googleMapsUrl || '',
          latitude: d.latitude || null,
          longitude: d.longitude || null,
          rating: d.rating || 0,
          totalReviews: d.totalReviews || 0,
          gbpUrl: generatedReviewLink
        });
        
        // Open manual mode to let them review/edit the autofilled data
        setManualMode(true);
      } else {
        throw new Error('Failed to fetch details');
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch details. Please enter manually.');
      setManualMode(true);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleContinue = () => {
    if (!data.businessName || !data.phone) {
      setError('Please fill in the required fields (Business Name & Phone).');
      return;
    }
    setError('');
    
    // Auto skip Step 5 (Google Profiling) if placeId already exists
    if (data.googlePlaceId) {
      // In the parent orchestrator this would be slightly tricky to skip a specific step natively
      // But we can just proceed to next, and Step 5 will be pre-filled!
      onNext();
    } else {
      onNext();
    }
  };

  return (
    <div className="h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 flex flex-col border border-slate-100 relative">
      <div className={`flex-1 custom-scrollbar pr-2 pb-4 ${manualMode ? 'overflow-y-auto' : 'overflow-visible'}`}>
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
          <MapPin className="text-slate-900 w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Find your business</h2>
        <p className="text-slate-500 mb-8">Search for your business on Google Maps to autofill your details instantly.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* GOOGLE SEARCH BAR */}
        {!manualMode && (
          <div className="relative z-50">
            <label className="block text-sm font-bold text-slate-900 mb-2">Search Business Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isSearching || isFetchingDetails ? (
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length < 3) setShowDropdown(false);
                }}
                className="w-full pl-12 pr-4 py-4 text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                placeholder="Start typing your business name..."
                autoFocus
              />
            </div>

            {/* AUTOCOMPLETE DROPDOWN */}
            <AnimatePresence>
              {showDropdown && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] max-h-[300px] overflow-y-auto left-0"
                >
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectBusiness(item.placeId, item.mainText)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 border-b border-slate-50 flex items-start gap-4 transition-colors group"
                    >
                      <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                        <Store className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{item.mainText}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{item.secondaryText}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <span className="text-slate-400 text-sm">Can't find your business? </span>
              <button 
                onClick={() => setManualMode(true)}
                className="text-indigo-600 font-bold hover:underline text-sm"
              >
                Enter details manually
              </button>
            </div>
          </div>
        )}

        {/* MANUAL / AUTO-FILLED FORM */}
        {manualMode && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {data.googlePlaceId && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-green-800">Connected to Google Maps</div>
                  <div className="text-xs text-green-600 mt-0.5">We've auto-filled your details. Please review them below.</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Location/Business Name *</label>
              <input
                type="text"
                value={data.businessName}
                onChange={e => updateData({ businessName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="e.g. Acme Downtown"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Category</label>
                <input
                  type="text"
                  value={data.category}
                  onChange={e => updateData({ category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none capitalize"
                  placeholder="e.g. dental clinic"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={e => updateData({ phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Address</label>
              <input
                type="text"
                value={data.address}
                onChange={e => updateData({ address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="123 Main St, City, State"
              />
            </div>

            {!data.googlePlaceId && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setManualMode(false)}
                  className="text-slate-500 font-medium hover:text-slate-900 text-sm transition-colors mt-4"
                >
                  ← Back to search
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-auto">
        <button onClick={onBack} className="text-slate-500 font-bold hover:text-slate-900 transition-colors px-4 py-2">
          Back
        </button>
        <button 
          onClick={handleContinue}
          disabled={!manualMode && !data.googlePlaceId} // Prevent continuing without searching or entering manual mode
          className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
