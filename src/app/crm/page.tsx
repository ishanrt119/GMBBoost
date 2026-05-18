"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, MessageSquare, Phone, Activity, Search, Filter,
  PieChart, Calendar, ChevronRight, MoreVertical, Settings,
  MessageCircle, Star, Target, CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import KanbanBoard from "@/components/crm/KanbanBoard";
import ChatModal from "@/components/crm/ChatModal";

export default function CRMDashboard() {
  const [activeTab, setActiveTab] = useState("kanban");
  const [leads, setLeads] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, analyticsRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/analytics")
      ]);
      const leadsData = await leadsRes.json();
      const analyticsData = await analyticsRes.json();
      setLeads(leadsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to fetch CRM data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (id: string, updates: any) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchData(); // Refresh
    } catch (error) {
      console.error("Failed to update lead", error);
    }
  };

  const openChat = (lead: any) => {
    setSelectedLead(lead);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent mb-2 tracking-tight">AI Sales CRM</h1>
          <p className="text-white/40 font-medium">Manage WhatsApp leads and AI conversations.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            + Add Lead
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Leads", value: analytics.totalLeads, icon: Users, color: "text-blue-400" },
            { label: "Conversion Rate", value: `${analytics.conversionRate}%`, icon: Target, color: "text-green-400" },
            { label: "AI Interactions", value: analytics.aiResponseCount, icon: MessageCircle, color: "text-purple-400" },
            { label: "Active Pipelines", value: analytics.leadsByStatus?.length || 0, icon: Activity, color: "text-orange-400" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.07] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-white/40 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-8 overflow-x-auto">
        {['kanban', 'list', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'kanban' && (
                <KanbanBoard leads={leads} onUpdateLead={handleUpdateLead} onOpenChat={openChat} />
              )}
              {activeTab === 'list' && (
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02] border-b border-white/10 text-xs uppercase text-white/40 font-semibold tracking-wider">
                      <tr>
                        <th className="p-6">Lead</th>
                        <th className="p-6">Status</th>
                        <th className="p-6">Source</th>
                        <th className="p-6">Updated</th>
                        <th className="p-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leads.map((lead: any) => (
                        <tr key={lead._id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openChat(lead)}>
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                                {lead.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold">{lead.name}</div>
                                <div className="text-xs text-white/40">{lead.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">{lead.status}</span>
                          </td>
                          <td className="p-6 text-sm text-white/60">{lead.source}</td>
                          <td className="p-6 text-sm text-white/60">{format(new Date(lead.updatedAt), 'MMM d, yyyy')}</td>
                          <td className="p-6 text-right">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-white/40" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {isChatOpen && selectedLead && (
        <ChatModal 
          lead={selectedLead} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </div>
  );
}
