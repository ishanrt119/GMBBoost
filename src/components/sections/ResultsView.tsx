"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Download,
  Share2,
  Star,
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
} from "recharts";
import { cn } from "@/lib/utils";

export function ResultsView({ audit }: { audit: any }) {
  const { business, recommendations, reviews = [] } = audit;
  
  // Prepare Sentiment Data
  const positive = reviews.filter((r: any) => r.sentiment === "Positive").length;
  const negative = reviews.filter((r: any) => r.sentiment === "Negative").length;
  const neutral = reviews.length - positive - negative;
  
  const sentimentData = [
    { name: "Positive", value: Math.round((positive / reviews.length) * 100) || 0, color: "#10b981" },
    { name: "Neutral", value: Math.round((neutral / reviews.length) * 100) || 0, color: "#3b82f6" },
    { name: "Negative", value: Math.round((negative / reviews.length) * 100) || 0, color: "#ef4444" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2 uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" />
            Audit Report
          </div>
          <h1 className="text-4xl font-bold text-white">{business.name}</h1>
          <p className="text-white/40">{business.address}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all">
            <Share2 className="w-4 h-4" />
            Share Result
          </button>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 glass-dark p-10 rounded-[40px] border border-white/10 flex flex-col items-center text-center">
          <div className="relative w-48 h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: audit.overallScore }, { value: 100 - audit.overallScore }]}
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={450}
                  dataKey="value"
                >
                  <Cell fill="#8b5cf6" stroke="none" />
                  <Cell fill="rgba(255,255,255,0.05)" stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-white">{audit.overallScore}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Score</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {audit.overallScore > 80 ? "Excellent" : audit.overallScore > 60 ? "Good" : "Needs Improvement"}
          </h3>
          <p className="text-sm text-white/40 leading-relaxed">{audit.aiSummary}</p>
        </div>

        <div className="lg:col-span-8 glass-dark p-10 rounded-[40px] border border-white/10">
          <h3 className="text-xl font-bold text-white mb-8">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "SEO", score: audit.seoScore },
              { label: "Review", score: audit.reviewScore },
              { label: "Engagement", score: audit.engagementScore },
              { label: "Completeness", score: audit.completenessScore },
            ].map((metric, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                <div className="text-[10px] font-bold text-white/20 uppercase mb-4">{metric.label}</div>
                <div className="text-3xl font-extrabold text-white mb-2">{metric.score}%</div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${metric.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-dark p-10 rounded-[40px] border border-white/10">
          <h3 className="text-xl font-bold text-white mb-8">Sentiment Analysis</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} innerRadius={60} outerRadius={80} dataKey="value">
                  {sentimentData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-8">
            {sentimentData.map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-bold" style={{ color: item.color }}>{item.value}%</div>
                <div className="text-[10px] text-white/40 uppercase font-bold">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">AI Prioritized Actions</h3>
          {recommendations.slice(0, 4).map((rec: any, i: number) => (
            <div key={i} className="glass-dark p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
              <div className={cn("absolute top-0 left-0 w-1 h-full", rec.priority === "High" ? "bg-red-500" : "bg-primary")} />
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{rec.title}</h4>
                <span className="text-[8px] font-bold px-2 py-1 rounded bg-white/5 text-white/40 uppercase tracking-widest">{rec.priority}</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
