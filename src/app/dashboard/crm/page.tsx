"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Loader2, User, Phone, BrainCircuit } from "lucide-react";
import { toast } from "react-hot-toast";

const COLUMNS = [
  "New",
  "Contacted",
  "Qualified",
  "Interested",
  "Booking Pending",
  "Converted",
  "Lost",
];

export default function CRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      toast.error("Error loading CRM data");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const leadId = active.id as string;
    const newStatus = over.id as string;
    
    const lead = leads.find(l => l._id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));

    try {
      // In a real implementation we would have a PUT endpoint
      // await fetch(`/api/leads/${leadId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
      fetchLeads(); // Revert
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/95">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-h-screen overflow-hidden flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI CRM Pipeline</h1>
        <p className="text-gray-400">Track and manage your automated leads.</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 pb-4" style={{ minWidth: "max-content" }}>
            {COLUMNS.map((col) => (
              <div key={col} className="w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white/90">{col}</h3>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/70">
                    {leads.filter((l) => l.status === col).length}
                  </span>
                </div>
                
                <div 
                  id={col}
                  className="flex-1 min-h-[500px] bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  {leads
                    .filter((l) => l.status === col)
                    .map((lead) => (
                      <div
                        key={lead._id}
                        id={lead._id}
                        className="bg-black/40 border border-white/10 p-4 rounded-lg mb-3 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium text-white">{lead.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.aiSummary && (
                          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-gray-300">
                            <BrainCircuit className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                            <p className="line-clamp-2">{lead.aiSummary}</p>
                          </div>
                        )}
                        <div className="mt-3 flex justify-between items-center text-[10px]">
                          <span className="px-2 py-1 bg-white/10 rounded text-gray-300">
                            Intent: {lead.intentScore}%
                          </span>
                          <span className="text-gray-500">
                            {new Date(lead.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
