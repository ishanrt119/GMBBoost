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
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
          <div key={col} className="min-w-[320px] w-[320px] flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl p-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-white/80">{col}</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold text-white/60">
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
      className="bg-white/5 border border-white/10 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-purple-500/50 hover:bg-white/10 transition-all shadow-lg backdrop-blur-sm"
    >
      <div className="font-bold text-sm mb-1">{lead.name}</div>
      <div className="text-xs text-white/40 mb-4">{lead.phone}</div>
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
          {lead.source}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
          className="p-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
