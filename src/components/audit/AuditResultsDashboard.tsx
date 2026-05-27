'use client';

import { useEffect, useState } from 'react';
import { IAudit } from '@/models/Audit';
import ScoreRing from './ScoreRing';
import MetricCardsGrid from './MetricCards';
import CompetitorTable from './CompetitorTable';
import RecommendationsList from './RecommendationsList';
import { motion } from 'framer-motion';

export default function AuditResultsDashboard({ auditId }: { auditId: string }) {
  const [audit, setAudit] = useState<IAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchAudit = async () => {
      try {
        const res = await fetch(`/api/audit/${auditId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setAudit(data.audit);

        // Stop polling if completed or failed
        if (data.audit.status !== 'PENDING') {
          clearInterval(interval);
        }
      } catch (err: any) {
        setError(err.message);
        clearInterval(interval);
      }
    };

    fetchAudit(); // Initial fetch
    interval = setInterval(fetchAudit, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [auditId]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Audit Failed</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!audit || audit.status === 'PENDING') {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your Business Profile...</h2>
        <p className="text-slate-500">Our AI agent is reviewing your Google data and competitors.</p>
        <p className="text-sm text-slate-400 mt-2">This usually takes about 10-15 seconds.</p>
      </div>
    );
  }

  const { auditData, recommendations, competitors } = audit;

  const metrics = [
    { title: 'Profile Completeness', value: auditData?.completenessScore || 0, suffix: '%', trend: 'up' as const, trendValue: 'Good' },
    { title: 'Keyword Optimization', value: auditData?.keywordScore || 0, suffix: '/100' },
    { title: 'Review Sentiment', value: auditData?.sentimentScore || 0, suffix: '%', trend: 'up' as const, trendValue: 'Positive' },
    { title: 'Engagement Level', value: auditData?.engagementScore || 0, suffix: '/100', trend: 'down' as const, trendValue: 'Needs Work' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header & Overall Score */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-slate-900 mb-2 tracking-tight"
          >
            {audit.businessName}
          </motion.h1>
          <p className="text-lg text-slate-500 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {audit.location}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Report
            </button>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <ScoreRing score={audit.overallScore || 0} />
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricCardsGrid metrics={metrics} />

      {/* Main Content Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <CompetitorTable competitors={competitors || []} />
          <RecommendationsList recommendations={recommendations || []} />
        </div>
        
        <div className="lg:col-span-1 space-y-8">
          
          {/* Quick Wins */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Wins
            </h3>
            <ul className="space-y-3">
              {auditData?.quickWins?.map((win: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 bg-white/10 rounded-lg p-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-yellow-300 flex-shrink-0"></div>
                  <span className="text-sm text-blue-50 leading-snug">{win}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Strengths & Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">Profile Analysis</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="text-lg">+</span> Strengths
              </h4>
              <ul className="space-y-2">
                {auditData?.strengths?.map((str: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {str}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="text-lg">-</span> Weaknesses
              </h4>
              <ul className="space-y-2">
                {auditData?.weaknesses?.map((weak: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    {weak}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
