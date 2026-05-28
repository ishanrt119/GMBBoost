import React, { useState } from 'react';
import { OnboardingData } from './types';
import { ArrowRight, MessageSquare } from 'lucide-react';

interface Props {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepWhatsApp({ data, updateData, onNext, onBack }: Props) {
  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 flex flex-col border border-slate-100">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
          <MessageSquare className="text-green-600 w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Connect WhatsApp API</h2>
        <p className="text-slate-500 mb-8">Enter your Twilio credentials to enable the AI Sales Agent and automated text messaging. You can skip this and add it later.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Twilio Account SID</label>
            <input
              type="text"
              value={data.twilioSid}
              onChange={e => updateData({ twilioSid: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none font-mono text-sm"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Twilio Auth Token</label>
            <input
              type="password"
              value={data.twilioAuthToken}
              onChange={e => updateData({ twilioAuthToken: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none font-mono text-sm"
              placeholder="••••••••••••••••••••••••••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">WhatsApp / SMS Sender Number</label>
            <input
              type="tel"
              value={data.whatsappNumber}
              onChange={e => updateData({ whatsappNumber: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
              placeholder="+14155238886"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-auto">
        <button onClick={onBack} className="text-slate-500 font-bold hover:text-slate-900 transition-colors px-4 py-2">
          Back
        </button>
        <div className="flex items-center gap-4">
          <button onClick={onNext} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Skip for now
          </button>
          <button 
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
