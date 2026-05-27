"use client";

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
  Zap,
  Megaphone,
  UploadCloud,
  Star,
  Clock
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "AI Audits", icon: Zap, href: "/dashboard/audit" },
  { name: "AI Content", icon: Calendar, href: "/dashboard/content" },
  { name: "My Posts", icon: Megaphone, href: "/dashboard/posts" },
  { name: "Content History", icon: Clock, href: "/dashboard/history" },
  { name: "Review Manager", icon: Star, href: "/dashboard/reviews" },
  { name: "Review Campaigns", icon: Users, href: "/dashboard/campaigns" },
  { name: "Sales Inbox", icon: MessageSquare, href: "/dashboard/inbox" },
  { name: "WhatsApp CRM", icon: Users, href: "/dashboard/crm" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden lg:flex h-screen fixed top-0 left-0 z-50 overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <Rocket className="text-primary w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">GMB<span className="text-primary">Boost</span></span>
        </Link>

        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent",
                  isActive 
                    ? "bg-indigo-50 text-primary border-indigo-100 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
