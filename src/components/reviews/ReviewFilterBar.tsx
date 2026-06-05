import React from 'react';
import { motion } from 'framer-motion';

interface ReviewFilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
  counts?: Record<string, number>;
}

export default function ReviewFilterBar({ activeFilter, onFilterChange, activeSort, onSortChange, counts = {} }: ReviewFilterBarProps) {
  const filters = [
    { id: 'all', label: 'All Reviews' },
    { id: 'unanswered', label: 'Unanswered' },
    { id: 'critical', label: 'Critical' },
    { id: '5-star', label: '5-Star' },
    { id: 'positive', label: 'Positive' },
    { id: 'negative', label: 'Negative' }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar border-b border-slate-200 mb-6">
      {filters.map(f => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`relative px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
            activeFilter === f.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          {activeFilter === f.id && (
            <motion.div
              layoutId="activeFilterBg"
              className="absolute inset-0 bg-white border border-slate-200 shadow-sm rounded-full -z-10"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          {f.label}
          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeFilter === f.id ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'}`}>
            {counts[f.id] || 0}
          </span>
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-slate-500 font-medium">Sort by:</span>
        <select 
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent cursor-pointer font-medium shadow-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>
    </div>
  );
}
