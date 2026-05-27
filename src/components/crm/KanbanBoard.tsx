import React, { useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageCircle, Flame, Clock } from 'lucide-react';

const COLUMNS = ['New', 'Contacted', 'Qualified', 'Interested', 'Converted', 'Lost'];

export default function KanbanBoard({ leads, onUpdateLead, onOpenChat }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const columns = useMemo(() => {
    const cols: Record<string, any[]> = {};
    COLUMNS.forEach(c => cols[c] = []);
    leads.forEach((l: any) => {
      if (cols[l.status]) {
        cols[l.status].push(l);
      }
    });
    return cols;
  }, [leads]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    const leadId = active.id;
    const newStatus = over.id;
    
    const lead = leads.find((l: any) => l._id === leadId);
    if (lead && lead.status !== newStatus && COLUMNS.includes(newStatus)) {
      onUpdateLead(leadId, { status: newStatus });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-350px)] min-h-[500px]">
        {COLUMNS.map((col) => (
          <div key={col} className="min-w-[320px] w-[320px] flex flex-col bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-slate-900">{col}</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-bold text-slate-500">
                {columns[col].length}
              </span>
            </div>
            
            <DndContext id={col} onDragEnd={handleDragEnd}>
              <div className="flex-1 overflow-y-auto space-y-3 p-1">
                {columns[col].map(lead => (
                  <KanbanCard key={lead._id} lead={lead} onOpenChat={() => onOpenChat(lead)} />
                ))}
              </div>
            </DndContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}

function KanbanCard({ lead, onOpenChat }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: lead._id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpenChat}
      className="bg-white border border-slate-200 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-purple-500/50 hover:shadow-md transition-all shadow-sm"
    >
      <div className="font-bold text-slate-900 text-sm mb-1">{lead.name}</div>
      <div className="text-xs text-slate-500 mb-3">{lead.phone}</div>
      
      {/* AI Qualification Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {lead.intentScore > 0 && (
          <div className={`px-2 py-1 flex items-center gap-1 rounded-md text-[10px] font-bold ${lead.intentScore >= 80 ? 'bg-orange-100 text-orange-600 border border-orange-200' : lead.intentScore >= 50 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            <Flame className="w-3 h-3" />
            {lead.intentScore} Intent
          </div>
        )}
        {lead.qualificationStatus && (
          <div className="px-2 py-1 rounded-md bg-purple-100 text-purple-600 text-[10px] font-bold">
            {lead.qualificationStatus}
          </div>
        )}
        {lead.urgency && (
          <div className="px-2 py-1 flex items-center gap-1 rounded-md bg-red-100 text-red-600 text-[10px] font-bold border border-red-200">
            <Clock className="w-3 h-3" />
            {lead.urgency}
          </div>
        )}
      </div>

      {(lead.budget || lead.businessType) && (
        <div className="bg-slate-50 p-2 rounded-lg mb-4 text-[10px] text-slate-600 border border-slate-100">
          {lead.businessType && <div><span className="text-slate-400">Type:</span> {lead.businessType}</div>}
          {lead.budget && <div><span className="text-slate-400">Budget:</span> {lead.budget}</div>}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {lead.source}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
          className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
