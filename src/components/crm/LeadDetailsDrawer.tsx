import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Clock, Calendar, CheckCircle, Lightbulb, Activity, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function LeadDetailsDrawer({ lead, onClose }: any) {
  if (!lead) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-[#0f0f13] h-full border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-start sticky top-0 bg-[#0f0f13]/90 backdrop-blur-md z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                  {lead.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{lead.name}</h2>
                  <p className="text-sm text-white/40">{lead.phone}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">{lead.status}</span>
                {lead.intentScore >= 80 && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Hot Lead
                  </span>
                )}
                {lead.qualificationStatus && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold">{lead.qualificationStatus}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* AI Insights Panel */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lightbulb className="w-24 h-24" />
              </div>
              <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" /> AI Lead Insights
              </h3>
              
              <div className="space-y-4 relative z-10">
                {lead.intentScore >= 80 && (
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-orange-400">🔥</span> "Lead shows extremely strong buying intent. Highly recommended for immediate demo scheduling."
                  </div>
                )}
                {lead.urgency === 'High' || lead.urgency === 'Urgent' ? (
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-red-400">⏱️</span> "Urgent requirement detected. Prioritize follow-up."
                  </div>
                ) : null}
                {lead.bookingInterested && (
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-green-400">📅</span> "Lead expressed direct interest in booking a call."
                  </div>
                )}
                {!lead.intentScore && !lead.urgency && !lead.bookingInterested && (
                  <div className="text-sm text-white/50 italic">AI is currently analyzing this conversation to generate insights.</div>
                )}
              </div>
            </div>

            {/* Extracted Intelligence */}
            <div>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Extracted Intelligence</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 mb-1">Business Type</div>
                  <div className="font-semibold text-sm">{lead.businessType || '—'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 mb-1">Budget</div>
                  <div className="font-semibold text-sm">{lead.budget || '—'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 mb-1">Urgency</div>
                  <div className="font-semibold text-sm flex items-center gap-1">
                    {lead.urgency ? <Clock className="w-3 h-3 text-red-400" /> : null}
                    {lead.urgency || '—'}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 mb-1">Intent Score</div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex-1">
                      <div 
                        className={`h-full ${lead.intentScore >= 80 ? 'bg-orange-500' : lead.intentScore >= 50 ? 'bg-blue-500' : 'bg-white/40'}`} 
                        style={{ width: `${lead.intentScore || 0}%` }} 
                      />
                    </div>
                    {lead.intentScore || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements & Summary */}
            {(lead.requirements || lead.aiSummary) && (
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Requirements & Summary</h3>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                  {lead.requirements && (
                    <div>
                      <div className="text-xs font-semibold mb-1">Extracted Requirements:</div>
                      <p className="text-sm text-white/70 leading-relaxed">{lead.requirements}</p>
                    </div>
                  )}
                  {lead.aiSummary && (
                    <div>
                      <div className="text-xs font-semibold mb-1">AI Conversation Summary:</div>
                      <p className="text-sm text-white/70 leading-relaxed">{lead.aiSummary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Automation Status */}
            <div>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Automation Status</h3>
              <div className="bg-white/5 rounded-2xl border border-white/5 divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/80">Conversation Stage</span>
                  </div>
                  <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-md">{lead.conversationStage || 'N/A'}</span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/80">Next Follow-up</span>
                  </div>
                  <span className="text-xs font-bold">{lead.nextFollowUpDate ? format(new Date(lead.nextFollowUpDate), 'MMM d, yyyy') : 'None Scheduled'}</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
