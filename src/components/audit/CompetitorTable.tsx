'use client';

import { ICompetitor } from '@/models/Audit';
import { motion } from 'framer-motion';

interface CompetitorTableProps {
  competitors: ICompetitor[];
}

export default function CompetitorTable({ competitors }: CompetitorTableProps) {
  if (!competitors || competitors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Competitor Comparison</h3>
        <p className="text-sm text-slate-500 mt-1">See how you stack up against top local competitors.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Business Name</th>
              <th className="px-6 py-4 font-medium">Est. Score</th>
              <th className="px-6 py-4 font-medium">Reviews</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium">Posts/Mo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {competitors.map((comp, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{comp.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    comp.score >= 80 ? 'bg-green-100 text-green-800' :
                    comp.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {comp.score}/100
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{comp.reviews}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-900 font-medium">{comp.rating}</span>
                    <span className="text-yellow-400 text-sm">★</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{comp.postsPerMonth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
