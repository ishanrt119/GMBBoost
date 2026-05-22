"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Globe, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ResultsView } from "@/components/sections/ResultsView";

// --- Sub-Components ---

const AuditInput = ({ onStart, isLoading }: { onStart: (query: string) => void, isLoading: boolean }) => {
  const [query, setQuery] = useState("");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">AI Google Business Audit</h1>
        <p className="text-white/40 text-lg">Analyze, optimize, and grow your Google Business Profile using real-time AI-powered insights.</p>
      </div>

      <div className="glass-dark p-10 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden bg-glow">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Business Name or GMB URL</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Nexus Education Mumbai or Map URL" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              disabled={isLoading || !query}
              onClick={() => onStart(query)}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Run Live AI Audit"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
            <button className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
              Try Demo Audit
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
        <div className="flex items-center gap-2 text-sm text-white"><CheckCircle2 className="w-4 h-4" /> SerpApi (Google Maps)</div>
        <div className="flex items-center gap-2 text-sm text-white"><CheckCircle2 className="w-4 h-4" /> Groq AI (Llama 3)</div>
        <div className="flex items-center gap-2 text-sm text-white"><CheckCircle2 className="w-4 h-4" /> Local Storage</div>
      </div>
    </motion.div>
  );
};

const AuditLoader = () => {
  const steps = [
    "Connecting to SerpApi",
    "Fetching Google Maps Business Data",
    "Extracting Real Customer Reviews",
    "Processing SEO Gaps with Groq AI",
    "Calculating Growth Scores",
    "Finalizing Performance Report"
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-20 flex flex-col items-center">
      <div className="relative w-32 h-32 mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-8 text-white">Groq AI Audit in Progress...</h2>
      <div className="w-full space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {idx < currentStep ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : idx === currentStep ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-white/10" />
              )}
              <span className={cn(
                "text-sm font-medium transition-colors",
                idx <= currentStep ? "text-white" : "text-white/20"
              )}>
                {step}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AuditPage() {
  const [state, setState] = useState<"input" | "loading" | "results">("input");
  const [audit, setAudit] = useState<any>(null);
  const [error, setError] = useState("");

  const startAudit = async (query: string) => {
    setState("loading");
    setError("");
    try {
      const response = await axios.post("/api/audit", { query });
      const newAudit = response.data;
      
      // Save to Local Storage
      const existingAudits = JSON.parse(localStorage.getItem("gmb_audits") || "[]");
      localStorage.setItem("gmb_audits", JSON.stringify([newAudit, ...existingAudits]));
      
      setAudit(newAudit);
      setState("results");
    } catch (err: any) {
      setError(err.response?.data?.error || "Audit failed. Please check your SerpApi/Groq keys.");
      setState("input");
    }
  };

  return (
    <div className="py-10">
      <AnimatePresence mode="wait">
        {state === "input" && (
          <div className="space-y-8">
            <AuditInput key="input" onStart={startAudit} isLoading={false} />
            {error && (
              <div className="max-w-3xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>
        )}
        {state === "loading" && (
          <AuditLoader key="loading" />
        )}
        {state === "results" && audit && (
          <ResultsView key="results" audit={audit} />
        )}
      </AnimatePresence>
    </div>
  );
}
