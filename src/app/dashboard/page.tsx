"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  MoreVertical,
  Users,
  Loader2,
  MessageCircle
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>({
    audits: [],
    reviews: [],
    leads: [],
    posts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [auditsRes, reviewsRes, leadsRes, postsRes] = await Promise.all([
          fetch("/api/audit").then(res => res.json()),
          fetch("/api/reviews").then(res => res.json()),
          fetch("/api/leads").then(res => res.json()),
          fetch("/api/posts").then(res => res.json())
        ]);

        setData({
          audits: Array.isArray(auditsRes) ? auditsRes : [],
          reviews: Array.isArray(reviewsRes) ? reviewsRes : [],
          leads: Array.isArray(leadsRes) ? leadsRes : [],
          posts: Array.isArray(postsRes) ? postsRes : []
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const stats = [
    { label: "Total Audits", value: data.audits.length, change: "Active", trending: true },
    { label: "New Reviews", value: data.reviews.length, change: "Live", trending: true },
    { label: "WhatsApp Leads", value: data.leads.length, change: "Tracking", trending: true },
    { label: "Scheduled Posts", value: data.posts.length, change: "Planned", trending: true },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Calculate Average Score if audits exist
  const avgScore = data.audits.length > 0 
    ? Math.round(data.audits.reduce((acc: number, cur: any) => acc + (cur.overallScore || 0), 0) / data.audits.length)
    : 0;

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Dashboard Overview</h1>
          <p className="text-white/40">Here's what's happening with your business profiles across MongoDB.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/crm" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <MessageCircle className="w-4 h-4" />
            AI WhatsApp CRM
          </Link>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Search className="w-4 h-4" />
            Run AI GMB Audit
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-dark p-6 rounded-[24px] border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-white/5 text-white/60">
                {idx === 0 && <Search className="w-4 h-4" />}
                {idx === 1 && <Star className="w-4 h-4" />}
                {idx === 2 && <Users className="w-4 h-4" />}
                {idx === 3 && <Clock className="w-4 h-4" />}
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trending ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}`}>
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1 text-white">{stat.value}</div>
            <div className="text-xs text-white/40 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Section: Pipeline & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lead Pipeline */}
        <div className="lg:col-span-8 glass-dark rounded-[32px] border border-white/10 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Recent Leads (MongoDB)</h3>
            <Link href="/crm" className="text-primary text-sm font-bold hover:underline">View Pipeline</Link>
          </div>
          <div className="space-y-4">
            {data.leads.length === 0 ? (
              <p className="text-white/40 text-sm">No leads found in database.</p>
            ) : (
              data.leads.slice(0, 5).map((lead: any, i: number) => (
                <div key={lead._id || i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {lead.name ? lead.name.substring(0, 2).toUpperCase() : "??"}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{lead.name}</div>
                      <div className="text-[10px] text-white/40">Status: {lead.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
                      {lead.source}
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-white/40" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-dark rounded-[32px] border border-white/10 p-8 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2 text-white">Avg Growth Score: {avgScore || 0}/100</h4>
            <p className="text-xs text-white/40 leading-relaxed mb-6">
              Based on {data.audits.length} recent audits stored in your Atlas database.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-[10px] text-white/60">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Cloud connected successfully
              </li>
              <li className="flex items-center gap-2 text-[10px] text-white/60">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Mongoose models loaded
              </li>
            </ul>
            <button className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold hover:scale-[1.02] transition-all">
              View All Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
