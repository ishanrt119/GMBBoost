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
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "AI Audits", icon: Zap, href: "/dashboard/audit" },
  { name: "AI Content", icon: Calendar, href: "/dashboard/content" },
  { name: "Review Manager", icon: MessageSquare, href: "/dashboard/reviews" },
  { name: "Review Campaigns", icon: Megaphone, href: "/dashboard/campaigns" },
  { name: "Upload Customers", icon: UploadCloud, href: "/dashboard/upload" },
  { name: "WhatsApp CRM", icon: Users, href: "/dashboard/crm" },
  { name: "My Posts", icon: Calendar, href: "/dashboard/posts" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col hidden lg:flex h-screen fixed top-0 left-0 z-50 overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:rotate-12 transition-transform duration-300">
            <Rocket className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">GMB<span className="text-primary">Boost</span></span>
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
                    ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
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
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
