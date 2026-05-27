"use client";

import { Search, Bell } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-20 border-b border-slate-200 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full">
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 focus:border-primary/50 outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-200">
          <Bell className="w-5 h-5 text-slate-500" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900">Admin User</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Growth Plan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
