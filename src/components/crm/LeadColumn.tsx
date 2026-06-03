import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import LeadCard from './LeadCard';

interface LeadColumnProps {
  id: string;
  title: string;
  leads: any[];
  onLeadClick: (lead: any) => void;
}

export default function LeadColumn({ id, title, leads, onLeadClick }: LeadColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col bg-slate-50 rounded-2xl w-[320px] flex-shrink-0 border border-slate-200/60 h-full max-h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200/60 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
        <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">{title}</h3>
        <span className="bg-white text-slate-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
          {leads.length}
        </span>
      </div>

      <div 
        ref={setNodeRef} 
        className={`flex-1 p-3 overflow-y-auto transition-colors ${isOver ? 'bg-indigo-50/50' : ''}`}
      >
        <SortableContext items={leads.map(l => l._id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead._id} lead={lead} onClick={onLeadClick} />
          ))}
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl m-1">
            <span className="text-xs text-slate-400 font-medium">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}
