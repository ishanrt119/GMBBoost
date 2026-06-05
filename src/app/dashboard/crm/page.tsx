'use client';

import React, { useState, useEffect } from 'react';
import CRMStatsRow from '@/components/crm/CRMStatsRow';
import KanbanBoard from '@/components/crm/KanbanBoard';
import LeadListView from '@/components/crm/LeadListView';
import LeadDrawer from '@/components/crm/LeadDrawer';
import { LayoutList, Columns } from 'lucide-react';

type ViewMode = 'list' | 'kanban';

export default function CRMDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, converted: 0, conversionRate: 0, avgScore: 0 });
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [kanbanColumns, setKanbanColumns] = useState<string[]>([]);

  const businessId = '60b9b3b3b3b3b3b3b3b3b3b3';

  const fetchLeads = async () => {
    try {
      const res = await fetch(`/api/crm/leads?businessId=${businessId}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);

        const total = data.leads.length;
        const converted = data.leads.filter((l: any) => l.pipelineStage === 'Converted').length;
        const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

        const scoredLeads = data.leads.filter((l: any) => l.aiLeadScore);
        const avgScore = scoredLeads.length > 0
          ? Math.round(scoredLeads.reduce((acc: number, l: any) => acc + l.aiLeadScore, 0) / scoredLeads.length)
          : 0;

        setStats({ total, converted, conversionRate, avgScore });
      }
    } catch (e) {
      console.error('Failed to fetch leads', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchKanbanColumns = async () => {
    try {
      const res = await fetch('/api/business/kanban-columns');
      const data = await res.json();
      if (data.success) {
        setKanbanColumns(data.kanbanColumns);
      }
    } catch (e) {
      console.error('Failed to fetch kanban columns', e);
    }
  };

  const saveKanbanColumns = async (cols: string[]) => {
    try {
      await fetch('/api/business/kanban-columns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kanbanColumns: cols })
      });
    } catch (e) {
      console.error('Failed to save kanban columns', e);
    }
  };

  // Wrapper so every column change also saves to DB
  const handleSetKanbanColumns = (updater: string[] | ((prev: string[]) => string[])) => {
    setKanbanColumns(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveKanbanColumns(next);
      return next;
    });
  };

  useEffect(() => {
    fetchLeads();
    fetchKanbanColumns();
  }, []);

  const handleCreateDummyLead = async () => {
    try {
      const newLead = {
        businessId,
        name: 'John Smith',
        phone: '+14155552671',
        source: 'WhatsApp',
      };
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      if (res.ok) fetchLeads();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-slate-500">Loading AI Lead Manager...</div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 pt-10">
      <div className="max-w-[1600px] mx-auto relative">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Lead Manager</h1>
            <p className="text-slate-500 mt-1">Intelligent CRM with automated follow-ups and LLaMA scoring.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Columns className="w-4 h-4" />
                Kanban
              </button>
            </div>

            {/* Add Lead */}
            <button
              onClick={handleCreateDummyLead}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          </div>
        </div>

        {/* Stats */}
        <CRMStatsRow stats={stats} />

        {/* View */}
        {viewMode === 'list' ? (
          <LeadListView leads={leads} onLeadClick={setSelectedLead} />
        ) : (
          <KanbanBoard
            leads={leads}
            setLeads={setLeads}
            onLeadClick={setSelectedLead}
            columns={kanbanColumns}
            setColumns={handleSetKanbanColumns}
          />
        )}

        {/* Lead Drawer */}
        <LeadDrawer
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={fetchLeads}
        />
      </div>
    </div>
  );
}