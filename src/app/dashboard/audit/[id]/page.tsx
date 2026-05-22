"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { ResultsView } from "@/components/sections/ResultsView";
import { Loader2 } from "lucide-react";

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("gmb_audits") || "[]");
    const found = saved.find((a: any) => a.id === id);
    setAudit(found);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!audit) {
    return notFound();
  }

  return (
    <div className="py-10">
      <ResultsView audit={audit} />
    </div>
  );
}
