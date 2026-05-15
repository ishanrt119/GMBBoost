"use client";

import { motion } from "framer-motion";
import { 
  Rocket, 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  Bell,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MoreVertical
} from "lucide-react";
import Link from "next/link";

const sidebarLinks = [
  { name: "Overview", icon: LayoutDashboard, active: true },
  { name: "AI Content", icon: Calendar },
  { name: "Review Manager", icon: MessageSquare },
  { name: "Lead Agent", icon: Users },
  { name: "Analytics", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

const stats = [
  { label: "Profile Views", value: "1,284", change: "+12.5%", trending: true },
  { label: "New Reviews", value: "24", change: "+8.2%", trending: true },
  { label: "WhatsApp Leads", value: "48", change: "+15.3%", trending: true },
  { label: "Avg. Response Time", value: "2.4m", change: "-18%", trending: true },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#030014] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col hidden lg:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-10 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">GMB<span className="text-primary">Boost</span></span>
          </Link>

          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <button
                key={link.name}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  link.active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{link.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/20 backdrop-blur-md">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
              <Bell className="w-5 h-5 text-white/60" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#030014]" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/5">
              <div className="text-right">
                <div className="text-sm font-bold">Admin User</div>
                <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Growth Plan</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10 pb-10">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
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
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-white/40 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Main Section: Pipeline & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Lead Pipeline */}
              <div className="lg:col-span-8 glass-dark rounded-[32px] border border-white/10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Recent WhatsApp Leads</h3>
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
                          <div className="text-sm font-bold">{i === 1 ? "John Smith" : i === 2 ? "Maria Khan" : "Lee Wong"}</div>
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
                  <h4 className="text-lg font-bold mb-2">Growth Score: 84/100</h4>
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
        </div>
      </main>
    </div>
  );
}
