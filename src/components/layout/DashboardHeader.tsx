"use client";

import { Search, Bell } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/20 backdrop-blur-md sticky top-0 z-40 w-full">
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-primary/50 outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
          <Bell className="w-5 h-5 text-white/60" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#030014]" />
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-white/5">
          <div className="text-right">
            <div className="text-sm font-bold text-white">Admin User</div>
            <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Growth Plan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
