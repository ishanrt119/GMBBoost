import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import LeadColumn from './LeadColumn';
import LeadCard from './LeadCard';

const STAGES = ['New', 'Contacted', 'Qualified', 'Interested', 'Not Interested', 'Converted'];

interface KanbanBoardProps {
  leads: any[];
  setLeads: React.Dispatch<React.SetStateAction<any[]>>;
  onLeadClick: (lead: any) => void;
}

export default function KanbanBoard({ leads, setLeads, onLeadClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current;
    const isOverColumn = STAGES.includes(overId as string);

    if (!isActiveTask) return;

    // Moving lead over a different column empty area
    if (isOverColumn) {
      setLeads((prev) => {
        const activeIndex = prev.findIndex((t) => t._id === activeId);
        const newLeads = [...prev];
        newLeads[activeIndex] = { ...newLeads[activeIndex], pipelineStage: overId };
        return newLeads;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeLead = active.data.current;
    if (!activeLead) return;
    
    // We update the backend with the new stage
    const newStage = over.id as string;
    
    // Check if dropping on a card instead of empty column
    const overData = over.data.current;
    const targetStage = STAGES.includes(newStage) ? newStage : overData?.pipelineStage;

    if (targetStage && activeLead.pipelineStage !== targetStage) {
      try {
        await fetch(`/api/crm/leads/${activeLead._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pipelineStage: targetStage })
        });
      } catch (err) {
        console.error('Failed to update lead stage:', err);
      }
    }
  };

  const activeLead = activeId ? leads.find(l => l._id === activeId) : null;

  return (
    <div className="h-[calc(100vh-280px)] min-h-[500px]">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-6 overflow-x-auto pb-4 hide-scrollbar">
          {STAGES.map(stage => (
            <LeadColumn 
              key={stage} 
              id={stage} 
              title={stage} 
              leads={leads.filter(l => l.pipelineStage === stage)} 
              onLeadClick={onLeadClick}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
