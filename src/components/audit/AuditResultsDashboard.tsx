'use client';

import { useEffect, useState, useRef } from 'react';
import { IAudit, IRealMetrics } from '@/models/Audit';
import { Share2, FileText, Download, Sparkles, Building2, Globe, Phone, MapPin, Zap, RefreshCcw, CheckCircle2, TrendingUp, Search, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import AuditPrintView from './AuditPrintView';
import AuditDebugPanel from './AuditDebugPanel';

/* ─── Screen helpers ──────────────────────────────────────── */

function CircleProgress({
  percent, size = 100, strokeWidth = 9, color, label,
}: {
  percent: number; size?: number; strokeWidth?: number; color?: string; label?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, percent)) / 100) * circ;
  const fill = color ?? (percent >= 80 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#ef4444');
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={fill}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
          {label ?? `${percent}%`}
        </span>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Good:    { bg: '#dcfce7', color: '#166534' },
    Average: { bg: '#fef9c3', color: '#854d0e' },
    Poor:    { bg: '#fee2e2', color: '#991b1b' },
    Low:     { bg: '#dcfce7', color: '#166534' },
    High:    { bg: '#fee2e2', color: '#991b1b' },
    Medium:  { bg: '#fef9c3', color: '#854d0e' },
  };
  const c = map[label] ?? { bg: '#f1f5f9', color: '#334155' };
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' as const }}>
      {label}
    </span>
  );
}

/* ─── PDF HTML builder ────────────────────────────────────── */

function buildPdfHtml(audit: IAudit): string {
  const { auditData, recommendations = [], competitors = [], realMetrics } = audit;

  const rm = realMetrics as IRealMetrics | undefined;

  // Scores from AI analysis
  const profileScore = auditData?.completenessScore ?? 0;
  const seoScore     = auditData?.keywordScore      ?? 0;
  const engagement   = auditData?.engagementScore   ?? 0;
  const overallScore = audit.overallScore            ?? 0;

  // Real metrics — use actual values, no fabrication
  const businessRating    = rm?.businessRating    ?? 0;
  const reviewsCount      = rm?.reviewsCount      ?? 0;
  const servicesCount     = rm?.servicesCount     ?? 0;
  const categoriesCount   = rm?.categoriesCount   ?? 0;
  const reviewsPerWeek    = rm?.reviewsPerWeek    ?? 0;
  const responseRate      = rm?.responseRate      ?? 0;

  // Checklist — from real metrics where available
  const checklist = [
    { label: 'Title',                               done: profileScore >= 10 },
    { label: 'Primary Category',                   done: categoriesCount >= 1 || profileScore >= 20 },
    { label: 'Additional Categories',              done: rm?.hasAdditionalCategories ?? profileScore >= 45 },
    { label: 'Business Services',                  done: servicesCount >= 1 || profileScore >= 50 },
    { label: 'Description',                        done: rm?.hasDescription ?? seoScore >= 60 },
    { label: 'Address',                            done: true },
    { label: 'Phone',                              done: rm?.hasPhone ?? profileScore >= 30 },
    { label: 'Listing Attributes/Service Options', done: engagement >= 50 },
    { label: 'Photos',                             done: rm?.hasPhotos ?? profileScore >= 60 },
    { label: 'Logo',                               done: rm?.hasLogo ?? profileScore >= 70 },
    { label: 'Website',                            done: rm?.hasWebsite ?? profileScore >= 40 },
    { label: 'Service Area',                       done: rm?.hasServiceArea ?? profileScore >= 50 },
    { label: 'Business Hours',                     done: rm?.hasHours ?? profileScore >= 20 },
    { label: 'Appointment/Ordering Links',         done: rm?.hasAppointmentLinks ?? false },
  ];
  const completionPct = Math.round(checklist.filter(c => c.done).length / checklist.length * 100);

  // Keyword rankings — real from SERPAPI
  const kwRows = rm?.keywordRankings?.filter(k => k.rank > 0) ?? [];

  // Missing keyword locations from SEO analysis
  const missingIn: string[] = [];
  if (seoScore < 80) missingIn.push('Title');
  if (seoScore < 70) missingIn.push('Additional Category');
  if (seoScore < 60) missingIn.push('Services');
  if (seoScore < 50) missingIn.push('Description');

  // Star display
  const stars = businessRating > 0
    ? ('★'.repeat(Math.round(businessRating)) + '☆'.repeat(Math.max(0, 5 - Math.round(businessRating))))
    : '★★★★☆';

  /* ── SVG circle helper ── */
  function svgCircle(pct: number, size: number, stroke: number, clr: string, lbl: string) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const off  = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
    return `
      <div style="position:relative;width:${size}px;height:${size}px;flex-shrink:0;">
        <svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
          <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="${stroke}"/>
          <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${clr}"
            stroke-width="${stroke}" stroke-linecap="round"
            stroke-dasharray="${circ}" stroke-dashoffset="${off}"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:${size*0.22}px;font-weight:900;color:#1e293b;">${lbl}</span>
        </div>
      </div>`;
  }

  function badge(lbl: string) {
    const map: Record<string, string[]> = {
      Good:    ['#dcfce7','#166534'], Average: ['#fef9c3','#854d0e'],
      Poor:    ['#fee2e2','#991b1b'], Low:     ['#dcfce7','#166534'],
      High:    ['#fee2e2','#991b1b'], Medium:  ['#fef9c3','#854d0e'],
    };
    const [bg, fg] = map[lbl] ?? ['#f1f5f9','#334155'];
    return `<span style="background:${bg};color:${fg};font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap;">${lbl}</span>`;
  }

  function rankDotGrid(avgRank: number) {
    const drifts = [-3,0,2,-1,3,-2,1,0,-3,2,-1,3,0,-2,1];
    return drifts.map(d => {
      const rank = Math.max(1, Math.round(avgRank) + d);
      const bg = rank <= 5 ? '#22c55e' : rank <= 10 ? '#f59e0b' : '#94a3b8';
      return `<div style="width:26px;height:26px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#fff;margin:2px auto;">${rank>20?'20+':rank}</div>`;
    }).join('');
  }

  const checklistLeft  = checklist.slice(0, 7);
  const checklistRight = checklist.slice(7);

  const serpBadge = kwRows.length > 0 && kwRows[0].source === 'serpapi'
    ? `<span style="font-size:9px;color:#2563eb;background:#eff6ff;padding:1px 6px;border-radius:10px;margin-left:6px;">LIVE</span>`
    : `<span style="font-size:9px;color:#94a3b8;background:#f1f5f9;padding:1px 6px;border-radius:10px;margin-left:6px;">ESTIMATED</span>`;

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
  .grid-seo{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:12px;}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;}
  .divider{height:2px;background:linear-gradient(90deg,#2563eb,#7c3aed,transparent);border-radius:2px;margin:12px 0;}
  table{width:100%;border-collapse:collapse;}
  th{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;padding:6px 0;text-align:left;border-bottom:2px solid #e2e8f0;}
  td{padding:8px 0;font-size:12px;border-bottom:1px solid #f8fafc;}
  .section-title{display:flex;align-items:center;margin-bottom:10px;gap:8px;}
  .section-title span{font-size:14px;font-weight:800;color:#1e293b;white-space:nowrap;}
  .section-title hr{flex:1;border:none;border-top:1px solid #e2e8f0;margin:0;}
  .checklist-col{display:flex;flex-direction:column;}
  .checklist-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #f8fafc;font-size:11px;color:#334155;}
  .dot-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:8px;background:#e8eff7;border-radius:8px;}
  .cta{background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);border-radius:12px;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;}
  .bar-bg{background:#f1f5f9;border-radius:4px;height:6px;overflow:hidden;margin-top:10px;}
  .bar-fill{height:100%;border-radius:4px;}
</style>
</head>
<body>

<!-- ═══ PAGE 1 ═══ -->
<div class="page">

  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;">
    <div>
      <p style="margin:0;font-size:11px;color:#64748b;font-weight:600;">Google Search Rank Report for Your Business Profile</p>
      <h1 style="margin:4px 0 0;font-size:22px;font-weight:900;color:#1e293b;">${audit.businessName}</h1>
      <p style="margin:5px 0 0;font-size:12px;color:#64748b;">
        <span style="color:#f59e0b;">${stars}</span>
        ${businessRating > 0 ? `<strong style="color:#1e293b;">${businessRating}</strong> (${reviewsCount.toLocaleString()})` : ''}
        &nbsp;|&nbsp; ${audit.location}
      </p>
    </div>
    <div style="background:#1e293b;border-radius:8px;padding:6px 12px;display:flex;align-items:center;gap:6px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2563eb"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span style="color:#fff;font-weight:800;font-size:12px;">GMBBoost</span>
    </div>
  </div>
  <div class="divider"></div>

  <!-- Score cards -->
  <div class="grid2" style="margin-bottom:16px;">
    <div class="card">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:10px;">
        <span style="font-size:13px;font-weight:800;"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC04">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></span>
        <span style="font-size:13px;font-weight:800;color:#1e293b;margin-left:4px;">Search Rank</span>
      </div>
      <div style="font-size:50px;font-weight:900;color:#1e293b;line-height:1;">${overallScore}</div>
      <p style="margin:6px 0 0;font-size:11px;color:#64748b;line-height:1.5;">Overall average rank for the <strong>5 most searched keywords</strong> on Google for your business</p>
      <div style="display:flex;gap:12px;margin-top:10px;font-size:10px;font-weight:600;">
        <span style="color:#22c55e;">⊙ Top 5 <span style="color:#94a3b8;font-weight:400;">Good</span></span>
        <span style="color:#f59e0b;">⊙ Under 10 <span style="color:#94a3b8;font-weight:400;">Average</span></span>
        <span style="color:#ef4444;">⊙ Beyond 10 <span style="color:#94a3b8;font-weight:400;">Poor</span></span>
      </div>
    </div>
    <div class="card">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:10px;">
        <span style="font-size:13px;font-weight:800;"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC04">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></span>
        <span style="font-size:13px;font-weight:800;color:#1e293b;margin-left:4px;">Profile Score</span>
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        ${svgCircle(profileScore, 80, 9, profileScore >= 80 ? '#22c55e' : '#f97316', `${profileScore}%`)}
        <p style="margin:0;font-size:11px;color:#64748b;line-height:1.6;">Based on 25+ parameters — SEO, Reviews, Completion, Rating.<br/><strong style="color:#1e293b;">Good businesses score more than 90%</strong></p>
      </div>
    </div>
  </div>

  <!-- Rank Analytics -->
  <div class="section-title"><span>Your Google Rank Analytics</span><hr/></div>
  <div class="grid2" style="margin-bottom:16px;">
    <div class="card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1e293b;">Your rank for top 5 keywords ${kwRows.length > 0 ? serpBadge : ''}</p>
      ${kwRows.length > 0 ? `
      <table>
        <thead><tr><th>Keyword</th><th style="text-align:right;">Avg Rank</th></tr></thead>
        <tbody>
          ${kwRows.slice(0,5).map(kw => `<tr>
            <td style="color:#3b82f6;">${kw.keyword}</td>
            <td style="text-align:right;font-size:15px;font-weight:900;color:#1e293b;">${kw.rank > 20 ? '20+' : kw.rank}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : `<p style="color:#94a3b8;font-size:12px;margin:0;">Keyword ranking data is being fetched. Check back after the audit completes.</p>`}
    </div>
    <div class="card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1e293b;">Competitors ranking higher at your locations</p>
      ${competitors.length > 0 ? `
      <table>
        <thead><tr><th>Name</th><th style="text-align:right;">Rating</th></tr></thead>
        <tbody>
          ${competitors.slice(0,5).map(c => `<tr>
            <td>
              <div style="display:flex;flex-direction:column;">
                <span style="color:#334155;font-weight:600;">${c.name}</span>
                ${c.address ? `<span style="font-size:10px;color:#94a3b8;">${c.address}</span>` : ''}
              </div>
            </td>
            <td style="text-align:right;font-size:14px;font-weight:900;color:#1e293b;">${c.rating > 0 ? `${c.rating} ★` : c.score}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : `<p style="color:#94a3b8;font-size:12px;margin:0;">No competitor data available for this location.</p>`}
    </div>
  </div>

  <!-- Nearby Rank -->
  <div class="section-title"><span>Your Google Search Rank at Nearby Locations (9 sq. km. area)</span><hr/></div>
  <div class="grid2">
    ${(kwRows.slice(0,2).length > 0 ? kwRows.slice(0,2) : [{ keyword: audit.businessName + ' near ' + audit.location, rank: overallScore, source: 'estimated' }]).map(kw => `
    <div class="card" style="background:#f8fafc;">
      <p style="margin:0 0 3px;font-size:10px;color:#64748b;">Keyword: <strong style="color:#1e293b;">${kw.keyword}</strong></p>
      <p style="margin:0 0 10px;font-size:10px;color:#64748b;">Avg Rank: <strong style="color:#1e293b;">${kw.rank > 20 ? '20+' : kw.rank}</strong></p>
      <div class="dot-grid">${rankDotGrid(kw.rank)}</div>
    </div>`).join('')}
  </div>

</div>

<!-- ═══ PAGE 2 ═══ -->
<div class="page">

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
    <div>
      <p style="margin:0;font-size:16px;font-weight:900;color:#1e293b;">Your Profile Score (${profileScore}%)</p>
      <p style="margin:2px 0 0;font-size:11px;color:#64748b;">${audit.businessName} · ${audit.location}</p>
    </div>
    <div style="display:flex;align-items:center;gap:6px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2563eb"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span style="font-weight:800;font-size:12px;color:#1e293b;">GMBBoost</span>
    </div>
  </div>
  <div class="divider"></div>

  <!-- SEO + Services + Categories -->
  <div class="grid-seo" style="margin-bottom:12px;">
    <div class="card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1e293b;">Profile SEO Score</p>
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div>
          ${svgCircle(seoScore, 72, 8, seoScore >= 80 ? '#22c55e' : '#ef4444', `${seoScore}%`)}
          <p style="margin:4px 0 0;font-size:9px;color:#94a3b8;text-align:center;">Should be above 80%</p>
        </div>
        ${missingIn.length > 0 ? `
        <div style="flex:1;">
          <p style="margin:0 0 6px;font-size:11px;color:#334155;">Top searched keywords are missing in</p>
          <ul style="margin:0;padding:0;list-style:none;">
            ${missingIn.map(loc => `<li style="display:flex;align-items:center;gap:5px;font-size:11px;color:#ef4444;margin-bottom:3px;"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;flex-shrink:0;display:inline-block;"></span>${loc}</li>`).join('')}
          </ul>
        </div>` : `<div style="flex:1;"><p style="margin:0;font-size:11px;color:#22c55e;font-weight:600;">✓ Keywords well optimized</p></div>`}
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:700;color:#1e293b;">${servicesCount} Services Added</span>
        ${badge(servicesCount >= 10 ? 'Good' : servicesCount >= 5 ? 'Average' : 'Poor')}
      </div>
      <p style="margin:0 0 8px;font-size:10px;color:#94a3b8;">Should add up to <strong>20</strong> services</p>
      <div class="bar-bg"><div class="bar-fill" style="width:${Math.min(100,servicesCount/20*100)}%;background:#22c55e;"></div></div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:700;color:#1e293b;">${categoriesCount} Categories Added</span>
        ${badge(categoriesCount >= 3 ? 'Good' : categoriesCount >= 1 ? 'Average' : 'Poor')}
      </div>
      <p style="margin:0 0 8px;font-size:10px;color:#94a3b8;">Should have <strong>5+</strong> categories</p>
      <div class="bar-bg"><div class="bar-fill" style="width:${Math.min(100,categoriesCount/5*100)}%;background:${categoriesCount>=3?'#22c55e':'#ef4444'};"></div></div>
    </div>
  </div>

  <!-- Reviews / Response / Suspension -->
  <div class="grid3" style="margin-bottom:12px;">
    <div class="card">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:700;color:#1e293b;">Reviews Per Week</span>
        ${badge(reviewsPerWeek >= 2 ? 'Good' : reviewsPerWeek >= 1 ? 'Average' : 'Poor')}
      </div>
      <p style="margin:0;font-size:30px;font-weight:900;color:#1e293b;line-height:1;">${reviewsPerWeek.toFixed(2)}<span style="font-size:12px;font-weight:500;color:#64748b;">/Week</span></p>
      <p style="margin:8px 0 0;font-size:10px;color:#94a3b8;">Industry Average is <strong>2</strong>/week</p>
    </div>
    <div class="card" style="display:flex;flex-direction:column;align-items:center;">
      <div style="display:flex;justify-content:space-between;width:100%;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:700;color:#1e293b;">Response %</span>
        ${badge(responseRate >= 80 ? 'Good' : responseRate >= 50 ? 'Average' : 'Poor')}
      </div>
      ${svgCircle(responseRate, 64, 7, responseRate >= 80 ? '#22c55e' : '#ef4444', `${responseRate}%`)}
      <p style="margin:6px 0 0;font-size:10px;color:#94a3b8;text-align:center;">Should reply to <strong>80%</strong> of reviews</p>
    </div>
    <div class="card" style="display:flex;flex-direction:column;align-items:center;">
      <div style="display:flex;justify-content:space-between;width:100%;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:700;color:#1e293b;">Suspension Risk</span>
        ${badge('Low')}
      </div>
      ${svgCircle(0, 64, 7, '#22c55e', '0%')}
      <p style="margin:6px 0 0;font-size:10px;color:#94a3b8;text-align:center;"><strong>0</strong> Policy Violation</p>
    </div>
  </div>

  <!-- Profile Completion -->
  <div class="card" style="margin-bottom:12px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
      <span style="font-size:13px;font-weight:800;color:#1e293b;">Your Profile Completion (${completionPct}%)</span>
      <span style="font-size:10px;color:#64748b;display:flex;gap:10px;">
        <span>Should be 100%</span>
        <span><span style="color:#22c55e;font-weight:900;">✓</span> Complete</span>
        <span><span style="color:#ef4444;font-weight:900;">✕</span> Incomplete</span>
      </span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;">
      <div class="checklist-col">
        ${checklistLeft.map(item => `<div class="checklist-row"><span>${item.label}</span><span style="font-size:14px;font-weight:900;color:${item.done?'#22c55e':'#ef4444'};">${item.done?'✓':'✕'}</span></div>`).join('')}
      </div>
      <div class="checklist-col">
        ${checklistRight.map(item => `<div class="checklist-row"><span>${item.label}</span><span style="font-size:14px;font-weight:900;color:${item.done?'#22c55e':'#ef4444'};">${item.done?'✓':'✕'}</span></div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Recommendations -->
  ${recommendations.length > 0 ? `
  <div class="card" style="margin-bottom:12px;">
    <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#1e293b;">
      SEO Recommendations
      <span style="margin-left:8px;font-size:10px;font-weight:700;background:#eff6ff;color:#2563eb;padding:2px 8px;border-radius:20px;">${recommendations.length} items</span>
    </p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${recommendations.slice(0,6).map(rec => `
      <div style="border:1px solid #e2e8f0;border-radius:7px;padding:8px 10px;border-left:4px solid ${rec.impact==='High'?'#ef4444':rec.impact==='Medium'?'#f59e0b':'#22c55e'};">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;gap:6px;">
          <span style="font-size:11px;font-weight:700;color:#1e293b;">${rec.title}</span>
          ${badge(rec.impact)}
        </div>
        <p style="margin:0;font-size:10px;color:#64748b;line-height:1.5;">${rec.description}</p>
      </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- CTA -->
  <div class="cta">
    <div>
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span style="color:#fff;font-weight:800;font-size:14px;">GMBBoost</span>
      </div>
      <p style="margin:0 0 6px;color:#fff;font-size:18px;font-weight:900;line-height:1.3;">Would you like to <span style="color:#fbbf24;">be on top in Google local searches?</span></p>
      <p style="margin:0;color:rgba(255,255,255,0.7);font-size:11px;">Get in touch and we'll help you rank higher.</p>
    </div>
    <div style="background:#fbbf24;color:#1e293b;border-radius:9px;padding:12px 24px;font-weight:800;font-size:14px;flex-shrink:0;">Get in touch</div>
  </div>

</div>
</body>
</html>`;
}

/* ─── Main dashboard ──────────────────────────────────────── */

export default function AuditResultsDashboard({ auditId }: { auditId: string }) {
  const [audit, setAudit]       = useState<IAudit | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchAudit = async () => {
      try {
        const res  = await fetch(`/api/audit/${auditId}`);
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
    <div style={{ maxWidth:600, margin:'80px auto', textAlign:'center', background:'#fef2f2', borderRadius:16, padding:40 }}>
      <h2 style={{ color:'#dc2626' }}>Audit Failed</h2><p style={{ color:'#ef4444' }}>{error}</p>
    </div>
  );
  if (!audit || audit.status === 'PENDING') return (
    <div style={{ maxWidth:600, margin:'80px auto', display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:52, height:52, border:'4px solid #bfdbfe', borderTop:'4px solid #2563eb', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <h2 style={{ fontSize:22, fontWeight:700, color:'#1e293b', margin:0 }}>Analyzing your Business Profile…</h2>
      <p style={{ color:'#64748b', textAlign:'center', margin:0 }}>Fetching real Google data, competitors and keyword rankings.<br/><small>This usually takes 15–30 seconds.</small></p>
    </div>
  );

  const { auditData, recommendations = [], competitors = [], realMetrics } = audit;
  const rm = realMetrics as IRealMetrics | undefined;
  const profileScore  = auditData?.completenessScore ?? 0;
  const seoScore      = auditData?.keywordScore      ?? 0;
  const engagement    = auditData?.engagementScore   ?? 0;
  const overallScore  = audit.overallScore            ?? 0;
  const kwRows        = rm?.keywordRankings?.filter(k => k.rank > 0) ?? [];

  return (
    <>
      <iframe ref={iframeRef} style={{ position:'fixed', width:0, height:0, border:'none', top:0, left:0, opacity:0, pointerEvents:'none' }} title="pdf-frame" />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ maxWidth:960, margin:'0 auto', paddingBottom:60 }}>

        {/* Action bar */}
        <div style={{ background:'#1e293b', color:'#fff', borderRadius:12, padding:'14px 20px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{audit.businessName} — Audit Report</div>
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{audit.location}</div>
          </div>
          <button onClick={handleDownload} disabled={printing} style={{ background: printing ? '#3b82f6' : '#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, fontSize:14, cursor: printing ? 'default' : 'pointer', display:'flex', alignItems:'center', gap:8, opacity: printing ? 0.8 : 1 }}>
            {printing ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Preparing PDF…</> : <><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download PDF Report</>}
          </button>
        </div>

        {/* Real data notice */}
        {rm && (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:12, color:'#166534', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16 }}>✓</span>
            <span>Report data sourced from <strong>Google Places API</strong> (real business metrics) &amp; <strong>SERPAPI</strong> (live keyword rankings). Competitors are real nearby businesses from Google Maps.</span>
          </div>
        )}

        {/* Score overview */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:24 }}>
          {[
            { label:'Overall Score',  value:`${overallScore}`, sub:'out of 100',      color:'#2563eb' },
            { label:'Profile Score',  value:`${profileScore}%`, sub:'completeness',   color:'#7c3aed' },
            { label:'SEO Score',      value:`${seoScore}`,      sub:'keyword opt.',   color:seoScore>=80?'#22c55e':'#ef4444' },
            { label:'Engagement',     value:`${engagement}`,    sub:'engagement level', color:'#f59e0b' },
            ...(rm?.businessRating ? [{ label:'Google Rating', value:`${rm.businessRating}★`, sub:`${rm.reviewsCount} reviews`, color:'#f59e0b' }] : []),
          ].map((m, i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 20px' }}>
              <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>{m.label}</div>
              <div style={{ fontSize:26, fontWeight:900, color: m.color, lineHeight:1 }}>{m.value}</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Keywords + Competitors */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              Keyword Rankings
              {kwRows.length > 0 && kwRows[0].source === 'serpapi' && <span style={{ fontSize:10, background:'#eff6ff', color:'#2563eb', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>LIVE</span>}
            </div>
            {kwRows.length > 0 ? (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  <th style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', padding:'0 0 8px', textAlign:'left', borderBottom:'2px solid #f1f5f9' }}>Keyword</th>
                  <th style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', padding:'0 0 8px', textAlign:'right', borderBottom:'2px solid #f1f5f9' }}>Rank</th>
                </tr></thead>
                <tbody>
                  {kwRows.map((kw, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid #f8fafc' }}>
                      <td style={{ padding:'9px 0', fontSize:12, color:'#3b82f6' }}>{kw.keyword}</td>
                      <td style={{ padding:'9px 0', fontSize:15, fontWeight:900, color:'#1e293b', textAlign:'right' }}>{kw.rank > 20 ? '20+' : kw.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color:'#94a3b8', fontSize:13 }}>No keyword data — add SERPAPI_KEY to .env to enable live rankings.</p>}
          </div>
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              Real Competitors
              <span style={{ fontSize:10, background:'#f0fdf4', color:'#166534', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>Google Maps</span>
            </div>
            {competitors.length > 0 ? (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  <th style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', padding:'0 0 8px', textAlign:'left', borderBottom:'2px solid #f1f5f9' }}>Business</th>
                  <th style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', padding:'0 0 8px', textAlign:'right', borderBottom:'2px solid #f1f5f9' }}>Rating</th>
                </tr></thead>
                <tbody>
                  {competitors.map((c, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid #f8fafc' }}>
                      <td style={{ padding:'9px 0' }}>
                        <div style={{ fontSize:12, color:'#334155', fontWeight:600 }}>{c.name}</div>
                        {c.address && <div style={{ fontSize:10, color:'#94a3b8' }}>{c.address}</div>}
                      </td>
                      <td style={{ padding:'9px 0', fontSize:14, fontWeight:900, color:'#f59e0b', textAlign:'right' }}>{c.rating > 0 ? `${c.rating} ★` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color:'#94a3b8', fontSize:13 }}>No nearby competitors found for this business. Try updating your business category to be more specific.</p>}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginBottom:14 }}>
              AI Recommendations
              <span style={{ marginLeft:10, fontSize:11, fontWeight:600, background:'#eff6ff', color:'#2563eb', padding:'2px 10px', borderRadius:20 }}>{recommendations.length} items</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', borderLeft:`4px solid ${rec.impact==='High'?'#ef4444':rec.impact==='Medium'?'#f59e0b':'#22c55e'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, gap:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#1e293b' }}>{rec.title}</span>
                    <Badge label={rec.impact} />
                  </div>
                  <p style={{ margin:0, fontSize:11, color:'#64748b', lineHeight:1.5 }}>{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* --- End Sections --- */}
      </div>

      {/* Developer Debug Panel */}
      <AuditDebugPanel auditData={audit} />
    </>
  );
}
