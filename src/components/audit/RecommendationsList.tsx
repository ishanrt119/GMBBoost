'use client';

import { IRecommendation } from '@/models/Audit';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface RecommendationsListProps {
  recommendations: IRecommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Actionable Recommendations</h3>
          <p className="text-sm text-slate-500 mt-1">AI-generated steps to improve your ranking.</p>
        </div>
        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          {recommendations.length} Items
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {recommendations.map((rec, idx) => (
          <RecommendationItem key={idx} recommendation={rec} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}

function RecommendationItem({ recommendation, index }: { recommendation: IRecommendation; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-6 hover:bg-slate-50 transition-colors">
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
              {index + 1}
            </span>
            <h4 className="text-base font-semibold text-slate-900">{recommendation.title}</h4>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <Badge label="Impact" value={recommendation.impact} type={recommendation.impact === 'High' ? 'success' : 'warning'} />
            <Badge label="Effort" value={recommendation.effort} type={recommendation.effort === 'High' ? 'danger' : 'neutral'} />
          </div>
        </div>
        
        <button className="text-slate-400 hover:text-slate-600 p-2">
          <svg
            className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pl-9 text-sm text-slate-600 leading-relaxed"
        >
          {recommendation.description}
        </motion.div>
      )}
    </div>
  );
}

function Badge({ label, value, type }: { label: string; value: string; type: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const colorClasses = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className={`flex items-center text-xs px-2 py-1 rounded-md border ${colorClasses[type]}`}>
      <span className="opacity-75 mr-1">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
