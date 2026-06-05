'use client';
import React, { useState } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { AlertTriangle, Loader2 } from 'lucide-react';

const PREDEFINED_CATEGORIES = [
  'University', 'College', 'School', 'Coaching Institute', 'Training Institute',
  'Restaurant', 'Cafe', 'Hotel', 'Gym', 'Fitness Center',
  'Dental Clinic', 'Dentist', 'Hospital', 'Medical Center',
  'Real Estate Agency', 'Marketing Agency', 'Software Company', 'IT Services',
  'Retail Store', 'Salon', 'Spa', 'Other'
];

export function CategoryMigrationPrompt() {
  const { activeBusiness, refreshBusiness } = useBusiness();
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Only show if business exists and lacks userDefinedCategory (or it's the default 'General')
  if (!activeBusiness) return null;
  const isMissingCategory = !activeBusiness.userDefinedCategory || activeBusiness.userDefinedCategory === 'General';
  if (!isMissingCategory) return null;

  const handleSave = async () => {
    if (!category.trim()) {
      setError('Please select or type a business category.');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      const res = await fetch('/api/business/category', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: activeBusiness._id, category })
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save category');
      
      await refreshBusiness();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="bg-rose-50 p-6 border-b border-rose-100 flex gap-4 items-start">
          <div className="bg-rose-100 p-3 rounded-full text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Action Required: Verify Category</h2>
            <p className="text-slate-600 text-sm mt-1">
              To generate highly accurate competitor insights and SEO keywords, we need you to explicitly define your industry. Google's automatic categories are often too generic.
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-bold text-slate-900 mb-2">Primary Business Category *</label>
          <div className="relative">
            <input
              type="text"
              list="migration-category-options"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none capitalize"
              placeholder="e.g. Dental Clinic, University..."
            />
            <datalist id="migration-category-options">
              {PREDEFINED_CATEGORIES.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Select from the list or type a custom category. This will permanently serve as the source of truth for your audits.
          </p>

          {error && <p className="text-rose-600 text-sm font-medium mt-3">{error}</p>}
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
