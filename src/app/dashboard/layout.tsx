import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { BusinessProvider } from "@/context/BusinessContext";
<<<<<<< HEAD
import { requireClient } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
=======

export default function DashboardLayout({
>>>>>>> integration-samarth
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
  const authResult = await requireClient();
  
  if (!authResult.ok) {
    redirect('/login');
  }

=======
>>>>>>> integration-samarth
  return (
    <BusinessProvider>
      <div className="min-h-screen bg-slate-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden lg:ml-64">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </BusinessProvider>
  );
}
