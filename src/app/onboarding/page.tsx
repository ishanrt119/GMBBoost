'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Loader2, Sparkles, MapPin, MessageSquare, Star } from 'lucide-react';

const STEPS = [
  { id: 'details', name: 'Business Details', icon: MapPin },
  { id: 'google', name: 'Google Profile', icon: Star },
  { id: 'whatsapp', name: 'WhatsApp Setup', icon: MessageSquare },
  { id: 'ai', name: 'AI Configuration', icon: Sparkles }
];

export default function OnboardingWizard() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Wizard Data State
  const [formData, setFormData] = useState({
    // Step 1
    description: '',
    keywords: '',
    // Step 2
    googlePlaceId: '',
    gbpUrl: '',
    // Step 3
    twilioSid: '',
    twilioAuthToken: '',
    whatsappNumber: '',
    // Step 4
    aiTone: 'professional',
    aiSalesPrompt: ''
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save onboarding data');
      
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Configure Your Workspace
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            Let's get your integrations and AI agent set up.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-indigo-100">
            <div 
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
            />
          </div>
          <div className="flex justify-between px-2">
            {STEPS.map((step, idx) => (
              <div key={step.id} className={`text-xs font-bold ${idx <= currentStep ? 'text-primary' : 'text-slate-400'}`}>
                {step.name}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6">
              {error}
            </div>
          )}

          {/* STEP 1: Details */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="text-primary w-6 h-6" /> Business Details
              </h3>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Short Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                  placeholder="e.g. We are a premier real estate agency in downtown..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">SEO Keywords (comma separated)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                  placeholder="real estate, homes for sale, apartments"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Google Profile */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="text-primary w-6 h-6" /> Google Business Profile
              </h3>
              <p className="text-sm text-slate-500">This powers your reputation management and AI review responses.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Google Place ID</label>
                <input
                  type="text"
                  value={formData.googlePlaceId}
                  onChange={e => setFormData({ ...formData, googlePlaceId: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                  placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Google Maps Public URL</label>
                <input
                  type="url"
                  value={formData.gbpUrl}
                  onChange={e => setFormData({ ...formData, gbpUrl: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          )}

          {/* STEP 3: WhatsApp */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="text-primary w-6 h-6" /> WhatsApp / Twilio Setup
              </h3>
              <p className="text-sm text-slate-500">Connect your Twilio account to enable the AI Sales Agent and automated SMS.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Twilio Account SID</label>
                <input
                  type="text"
                  value={formData.twilioSid}
                  onChange={e => setFormData({ ...formData, twilioSid: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Twilio Auth Token</label>
                <input
                  type="password"
                  value={formData.twilioAuthToken}
                  onChange={e => setFormData({ ...formData, twilioAuthToken: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                  placeholder="••••••••••••••••••••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                  placeholder="+14155238886"
                />
              </div>
            </div>
          )}

          {/* STEP 4: AI Config */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-primary w-6 h-6" /> AI Configuration
              </h3>
              <p className="text-sm text-slate-500">Train your dedicated AI Sales Agent.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Brand Tone of Voice</label>
                <select
                  value={formData.aiTone}
                  onChange={e => setFormData({ ...formData, aiTone: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                >
                  <option value="professional">Professional & Formal</option>
                  <option value="friendly">Friendly & Casual</option>
                  <option value="luxury">Luxury & Exclusive</option>
                  <option value="energetic">Energetic & Enthusiastic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Custom Sales Prompt</label>
                <textarea
                  rows={4}
                  value={formData.aiSalesPrompt}
                  onChange={e => setFormData({ ...formData, aiSalesPrompt: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-primary focus:border-primary font-medium text-slate-900"
                  placeholder="e.g. Your primary goal is to book a viewing for our listings. Never give exact pricing..."
                />
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className={`px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold transition-all ${
                currentStep === 0 ? 'opacity-0 cursor-default' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {!loading && currentStep === STEPS.length - 1 ? (
                <>Complete Setup <Check className="w-4 h-4" /></>
              ) : (
                <>Next Step <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
