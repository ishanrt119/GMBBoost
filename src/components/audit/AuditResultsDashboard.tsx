'use client';

import { useEffect, useState, useRef } from 'react';
import { IAudit } from '@/models/Audit';
import { Download, Sparkles, Building2, Globe, MapPin, Zap, TrendingUp, Search, MessageSquare, AlertCircle, Calendar, Target, ShieldAlert, Award, Loader2, CheckCircle2 } from 'lucide-react';
import AuditDebugPanel from './AuditDebugPanel';

/* ─── PDF HTML builder ────────────────────────────────────── */

function buildPdfHtml(audit: IAudit): string {
  const data = audit.auditData || {} as any;
  const overallScore = data.overallScore ?? 0;
  const searchRankScore = data.googleSearchRank?.score ?? 0;
  const profileScore = data.profileScore?.score ?? 0;
  const seoScore = data.seoScore?.score ?? 0;
  const reviewScore = data.reviewAnalysis?.score ?? 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Audit Report – ${audit.businessName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
  html,body{margin:0;padding:0;background:#fff;font-family:'Inter',-apple-system,sans-serif;font-size:13px;color:#1e293b;}
  @page{size:A4 portrait;margin:12mm 14mm;}
  .page{background:#fff;width:100%;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid;}
  .page:last-child{page-break-after:avoid;break-after:avoid;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;}
  .divider{height:2px;background:linear-gradient(90deg,#2563eb,#7c3aed,transparent);border-radius:2px;margin:12px 0;}
  table{width:100%;border-collapse:collapse;}
  th{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;padding:6px 0;text-align:left;border-bottom:2px solid #e2e8f0;}
  td{padding:8px 0;font-size:12px;border-bottom:1px solid #f8fafc;}
  .section-title{display:flex;align-items:center;margin-bottom:10px;gap:8px;}
  .section-title span{font-size:14px;font-weight:800;color:#1e293b;white-space:nowrap;}
  .section-title hr{flex:1;border:none;border-top:1px solid #e2e8f0;margin:0;}
  ul { padding-left: 20px; margin: 0; }
  li { margin-bottom: 6px; color: #334155; }
</style>
</head>
<body>

<div class="page">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;">
    <div>
      <p style="margin:0;font-size:11px;color:#64748b;font-weight:600;">Google Business Profile Audit</p>
      <h1 style="margin:4px 0 0;font-size:22px;font-weight:900;color:#1e293b;">${audit.businessName}</h1>
      <p style="margin:5px 0 0;font-size:12px;color:#64748b;">
        ${audit.location}
      </p>
    </div>
  </div>
  <div class="divider"></div>

  <!-- Scores -->
  <div class="grid3" style="margin-bottom:16px;">
    <div class="card" style="text-align:center;">
      <p style="margin:0 0 5px;font-size:12px;font-weight:700;">Overall Score</p>
      <h2 style="margin:0;font-size:32px;color:#2563eb;">${overallScore}/100</h2>
    </div>
    <div class="card" style="text-align:center;">
      <p style="margin:0 0 5px;font-size:12px;font-weight:700;">SEO Score</p>
      <h2 style="margin:0;font-size:32px;color:#22c55e;">${seoScore}/100</h2>
    </div>
    <div class="card" style="text-align:center;">
      <p style="margin:0 0 5px;font-size:12px;font-weight:700;">Profile Score</p>
      <h2 style="margin:0;font-size:32px;color:#7c3aed;">${profileScore}/100</h2>
    </div>
  </div>

  <div class="section-title"><span>Executive Summary</span><hr/></div>
  <div class="card" style="margin-bottom:16px; font-size:12px; line-height:1.6; color:#334155;">
    ${data.executiveSummary || 'No summary available.'}
  </div>

  <div class="grid2" style="margin-bottom:16px;">
    <div class="card">
      <p style="margin:0 0 8px;font-weight:700;color:#166534;">Strengths</p>
      <ul>${(data.strengths || []).map((s: string) => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="card">
      <p style="margin:0 0 8px;font-weight:700;color:#991b1b;">Weaknesses</p>
      <ul>${(data.weaknesses || []).map((s: string) => `<li>${s}</li>`).join('')}</ul>
    </div>
  </div>

</div>

<div class="page">
  <div class="section-title"><span>Growth & Opportunities</span><hr/></div>
  
  <div class="card" style="margin-bottom:16px;">
    <p style="margin:0 0 8px;font-weight:700;color:#2563eb;">Quick Wins</p>
    <ul>${(data.quickWins || []).map((s: string) => `<li>${s}</li>`).join('')}</ul>
  </div>

  <div class="card" style="margin-bottom:16px;">
    <p style="margin:0 0 8px;font-weight:700;color:#f59e0b;">Growth Opportunities</p>
    <ul>${(data.growthOpportunities || []).map((s: string) => `<li>${s}</li>`).join('')}</ul>
  </div>

  <div class="section-title"><span>Action Plan</span><hr/></div>
  
  <div class="card" style="margin-bottom:16px; border-left:4px solid #ef4444;">
    <p style="margin:0 0 8px;font-weight:700;color:#ef4444;">Priority Fixes (Fix immediately)</p>
    <ul>${(data.priorityFixes || []).map((s: string) => `<li>${s}</li>`).join('')}</ul>
  </div>

  <div class="grid2">
    <div class="card">
      <p style="margin:0 0 8px;font-weight:700;color:#1e293b;">30-Day Action Plan</p>
      <ol style="padding-left:20px; margin:0; font-size:12px;">${(data.thirtyDayPlan || []).map((s: string) => `<li style="margin-bottom:4px;">${s}</li>`).join('')}</ol>
    </div>
    <div class="card">
      <p style="margin:0 0 8px;font-weight:700;color:#1e293b;">90-Day Roadmap</p>
      <ol style="padding-left:20px; margin:0; font-size:12px;">${(data.ninetyDayPlan || []).map((s: string) => `<li style="margin-bottom:4px;">${s}</li>`).join('')}</ol>
    </div>
  </div>

</div>
</body>
</html>`;
}

/* ─── Main dashboard ──────────────────────────────────────── */

export default function AuditResultsDashboard({ auditId }: { auditId: string }) {
  const [audit, setAudit] = useState<IAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchAudit = async () => {
      try {
        const res = await fetch(`/api/audit/${auditId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAudit(data.audit);
        if (data.audit.status !== 'PENDING') clearInterval(interval);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load');
        clearInterval(interval);
      }
    };
    fetchAudit();
    interval = setInterval(fetchAudit, 3000);
    return () => clearInterval(interval);
  }, [auditId]);

  function handleDownload() {
    if (!audit) return;
    setPrinting(true);
    const iframe = iframeRef.current;
    if (!iframe) { setPrinting(false); return; }
    iframe.onload = () => {
      setTimeout(() => {
        try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
        finally { setPrinting(false); }
      }, 600);
    };
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { setPrinting(false); return; }
    doc.open(); doc.write(buildPdfHtml(audit)); doc.close();
  }

  /* Loading */
  if (error) return (
    <div className="max-w-xl mx-auto mt-20 text-center bg-red-50 border border-red-200 rounded-2xl p-10">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-red-700 mb-2">Audit Failed</h2>
      <p className="text-red-600">{error}</p>
    </div>
  );
  if (!audit || audit.status === 'PENDING') return (
    <div className="max-w-xl mx-auto mt-20 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your Business Profile…</h2>
        <p className="text-slate-500">
          Fetching local data and analyzing with AI.<br />
          <small className="text-slate-400">This usually takes 15–30 seconds.</small>
        </p>
      </div>
    </div>
  );

  const data = audit.auditData || {} as any;
  const overallScore = data.overallScore ?? 0;
  const searchRankScore = data.googleSearchRank?.score ?? 0;
  const profileScore = data.profileScore?.score ?? 0;
  const seoScore = data.seoScore?.score ?? 0;
  const reviewScore = data.reviewAnalysis?.score ?? 0;

  const competitors = data.competitors || [];
  const topKeywords = data.topKeywords || [];

  return (
    <>
      <iframe ref={iframeRef} className="fixed w-0 h-0 border-0 top-0 left-0 opacity-0 pointer-events-none" title="pdf-frame" />

      <div className="max-w-5xl mx-auto pb-20">

        {/* Action bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4 shadow-xl shadow-slate-900/10">
          <div>
            <h1 className="font-bold text-xl mb-1">{audit.businessName} — Audit Report</h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {audit.location}
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={printing}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-80"
          >
            {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {printing ? 'Preparing PDF…' : 'Download PDF Report'}
          </button>
        </div>

        {/* Top Level Scores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <ScoreCard title="Overall Score" score={overallScore} icon={<Award className="w-5 h-5 text-blue-500" />} />
          <ScoreCard title="Search Rank" score={searchRankScore} icon={<Search className="w-5 h-5 text-green-500" />} />
          <ScoreCard title="Profile Score" score={profileScore} icon={<Building2 className="w-5 h-5 text-purple-500" />} />
          <ScoreCard title="SEO Score" score={seoScore} icon={<TrendingUp className="w-5 h-5 text-rose-500" />} />
          <ScoreCard title="Review Score" score={reviewScore} icon={<MessageSquare className="w-5 h-5 text-amber-500" />} />
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" /> Executive Summary
          </h2>
          {data.executiveSummary ? (
            <div className="prose prose-slate max-w-none text-slate-600">
              {data.executiveSummary.split('\\n').map((p: string, i: number) => p.trim() ? <p key={i}>{p}</p> : null)}
            </div>
          ) : (
            <DataUnavailable />
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Key Strengths
            </h3>
            {data.strengths && data.strengths.length > 0 ? (
              <ul className="space-y-3">
                {data.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-emerald-800 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : <DataUnavailable />}
          </div>
          <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
            <h3 className="font-bold text-rose-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" /> Key Weaknesses
            </h3>
            {data.weaknesses && data.weaknesses.length > 0 ? (
              <ul className="space-y-3">
                {data.weaknesses.map((s: string, i: number) => (
                  <li key={i} className="text-rose-800 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : <DataUnavailable />}
          </div>
        </div>

        {/* Competitor Analysis */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-600" /> Competitor Analysis
          </h2>

          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">AI Competitors Mapping</h3>
          {competitors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500">Business Name</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500">Category</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 text-center">Rating</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 text-center">Reviews</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 text-center">Distance</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500">Reason</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 text-right">Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{c.category || '—'}</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-700 text-center">{c.rating || '—'}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 text-center">{c.reviewCount || '—'}</td>
                      <td className="py-3 px-4 text-xs text-slate-500 text-center">{c.distance || '—'}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{c.reason || '—'}</td>
                      <td className="py-3 px-4 text-sm font-bold text-amber-500 text-right">{c.strengthLevel || c.estimatedStrength || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <DataUnavailable />}
        </div>
        
        {/* Keywords Analysis */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-600" /> Top Keywords
          </h2>

          {topKeywords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500">Keyword</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500">Estimated Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {topKeywords.map((k: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{k.keyword}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{k.rank || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <DataUnavailable />}
        </div>

        {/* Opportunities Matrix */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <OpportunityCard title="Quick Wins" items={data.quickWins} icon={<Zap className="w-5 h-5 text-amber-500" />} />
          <OpportunityCard title="Growth Opportunities" items={data.growthOpportunities} icon={<TrendingUp className="w-5 h-5 text-purple-500" />} />
        </div>

        {/* Action Plan */}
        <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-400" /> Priority Fixes
            </h2>

            {data.priorityFixes && data.priorityFixes.length > 0 ? (
              <div className="grid gap-4 mb-10">
                {data.priorityFixes.map((r: string, i: number) => (
                  <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-5 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                    <p className="text-slate-200 mt-1">{r}</p>
                  </div>
                ))}
              </div>
            ) : <DataUnavailable light />}

            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
                  <Calendar className="w-5 h-5" /> 30-Day Action Plan
                </h3>
                {data.thirtyDayPlan && data.thirtyDayPlan.length > 0 ? (
                  <ul className="space-y-4">
                    {data.thirtyDayPlan.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : <DataUnavailable light />}
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
                  <Globe className="w-5 h-5" /> 90-Day Roadmap
                </h3>
                {data.ninetyDayPlan && data.ninetyDayPlan.length > 0 ? (
                  <ul className="space-y-4">
                    {data.ninetyDayPlan.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : <DataUnavailable light />}
              </div>
            </div>
          </div>
        </div>

      </div>

      <AuditDebugPanel auditData={audit} />
    </>
  );
}

/* ─── UI Components ──────────────────────────────────────── */

function ScoreCard({ title, score, icon }: { title: string, score: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
      <div className="mb-3">{icon}</div>
      <div className="text-3xl font-black text-slate-900 mb-1">{score}</div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</div>
    </div>
  );
}

function OpportunityCard({ title, items, icon }: { title: string, items: string[], icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <div className="flex-1">
        {items && items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : <DataUnavailable />}
      </div>
    </div>
  );
}

function DataUnavailable({ light = false }: { light?: boolean }) {
  return (
    <div className={`py-6 text-center rounded-xl border ${light ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
      <span className="text-sm font-medium">Data Unavailable</span>
    </div>
  );
}
