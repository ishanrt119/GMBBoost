"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "All Posts", href: "/dashboard/posts" },
  { name: "Pending", href: "/dashboard/posts/pending" },
  { name: "Scheduled", href: "/dashboard/posts/scheduled" },
  { name: "Create Post", href: "/dashboard/posts/create" },
];

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">My Posts</h1>
        <p className="text-white/60">Manage all your content posts</p>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl w-fit">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "px-6 py-2.5 rounded-xl font-medium text-sm transition-all",
                isActive
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}
