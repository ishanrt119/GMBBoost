"use client";

import { motion } from "framer-motion";
import { 
  Search,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  MoreVertical,
  Users
} from "lucide-react";

const stats = [
  { label: "Profile Views", value: "1,284", change: "+12.5%", trending: true },
  { label: "New Reviews", value: "24", change: "+8.2%", trending: true },
  { label: "WhatsApp Leads", value: "48", change: "+15.3%", trending: true },
  { label: "Avg. Response Time", value: "2.4m", change: "-18%", trending: true },
];

export default function Dashboard() {
  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Dashboard Overview</h1>
          <p className="text-white/40">Here's what's happening with your business profiles.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <Search className="w-4 h-4" />
          Run AI GMB Audit
        </button>
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
            <h3 className="text-xl font-bold text-white">Recent WhatsApp Leads</h3>
            <button className="text-primary text-sm font-bold hover:underline">View Pipeline</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {i === 1 ? "JS" : i === 2 ? "MK" : "LW"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{i === 1 ? "John Smith" : i === 2 ? "Maria Khan" : "Lee Wong"}</div>
                    <div className="text-[10px] text-white/40">Inquired about: Dental Services</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
                    WhatsApp AI Active
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-dark rounded-[32px] border border-white/10 p-8 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2 text-white">Growth Score: 84/100</h4>
            <p className="text-xs text-white/40 leading-relaxed mb-6">Your profile optimization is healthy. 3 quick tasks can boost it to 90+.</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-[10px] text-white/60">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Add missing service areas
              </li>
              <li className="flex items-center gap-2 text-[10px] text-white/60">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Reply to 2 pending reviews
              </li>
            </ul>
            <button className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold hover:scale-[1.02] transition-all">
              Show Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
