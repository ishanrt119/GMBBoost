import React, { useState } from 'react';
import { OnboardingData } from './types';
import { ArrowRight, MapPin } from 'lucide-react';

interface Props {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepBusiness({ data, updateData, onNext, onBack }: Props) {
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!data.businessName || !data.category || !data.phone) {
      setError('Please fill in the required fields.');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div className="h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 flex flex-col border border-slate-100">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
          <MapPin className="text-slate-900 w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">First Location Details</h2>
        <p className="text-slate-500 mb-8">Enter the specifics for your first physical location or digital brand.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
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
              <label className="block text-sm font-bold text-slate-900 mb-2">Category *</label>
              <input
                type="text"
                value={data.category}
                onChange={e => updateData({ category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="e.g. Dental Clinic"
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
            <label className="block text-sm font-bold text-slate-900 mb-2">Address (Optional)</label>
            <input
              type="text"
              value={data.address}
              onChange={e => updateData({ address: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
              placeholder="123 Main St, City, State"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-auto">
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
