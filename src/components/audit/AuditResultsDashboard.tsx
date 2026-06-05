import React from 'react';
import { IAuditHistory } from '../../models/AuditHistory';
import { CheckCircle, XCircle, Info, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function AuditResultsDashboard({ audit }: { audit: any }) {
  if (!audit) return null;

  const {
    snapshot,
    summary,
    profileData,
    seoAnalysis,
    reviewData,
    competitors,
    competitorLogs,
    competitorGapAnalysis,
    rankTrackingConfigured,
    keywordData,
    opportunities,
    quickWins,
    actionPlan
  } = audit;

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Complete') return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    if (status === 'Partial') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <XCircle className="w-5 h-5 text-rose-600" />;
  };

  const SectionCard = ({ title, children, noPadding = false }: { title: string, children: React.ReactNode, noPadding?: boolean }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 text-slate-800 bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 1. BUSINESS OVERVIEW & 12. EXECUTIVE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. BUSINESS OVERVIEW */}
        <div className="lg:col-span-1">
          <SectionCard title="1. Business Overview" noPadding>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <span className="block text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Business Name</span>
                <span className="font-bold text-slate-900 text-base">{snapshot?.name || 'Unknown'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Primary Category</span>
                <span className="font-semibold text-slate-700">{snapshot?.category || 'Unknown'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Address</span>
                <span className="text-slate-700">{snapshot?.address || 'Unknown'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-200 border-t border-slate-200">
              <div className="bg-white p-4 text-center">
                <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Rating</span>
                <span className="font-black text-2xl text-slate-800">{snapshot?.rating || 'N/A'}</span>
              </div>
              <div className="bg-white p-4 text-center">
                <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Reviews</span>
                <span className="font-black text-2xl text-slate-800">{snapshot?.reviewCount || '0'}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 12. EXECUTIVE SUMMARY */}
        <div className="lg:col-span-2">
          <SectionCard title="12. Executive Summary">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Competitive Position</span>
                <div className="mt-1 text-2xl font-black text-slate-900">{summary?.competitivePosition || 'Evaluating'}</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Growth Potential</span>
                <div className="mt-1 text-2xl font-black text-slate-900">{summary?.growthPotential || 'High'}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Key Strengths
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                  {summary?.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>) || <li>No distinct strengths identified yet.</li>}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Primary Weaknesses
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                  {summary?.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>) || <li>No major weaknesses found.</li>}
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* 2 & 3. GBP HEALTH & PROFILE COMPLETION */}
      <SectionCard title="2 & 3. GBP Health & Profile Completion">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Data Completeness Score</h3>
            <p className="text-sm text-slate-500">A missing field reduces your ability to rank for long-tail searches.</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-blue-600">{profileData?.completionPercent || 0}%</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileData?.fields && Object.entries(profileData.fields).map(([key, status]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
              <span className="font-semibold text-slate-700 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <StatusIcon status={status as string} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. REVIEW INTELLIGENCE */}
      <SectionCard title="4. Review Intelligence">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="text-xs font-bold text-slate-500 uppercase">Avg Rating</div>
            <div className="text-2xl font-black mt-1 text-slate-800">{reviewData?.averageRating || 'N/A'}</div>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="text-xs font-bold text-slate-500 uppercase">Total Reviews</div>
            <div className="text-2xl font-black mt-1 text-slate-800">{reviewData?.totalReviews || 0}</div>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="text-xs font-bold text-slate-500 uppercase">Last 30 Days</div>
            <div className="text-2xl font-black mt-1 text-slate-800">{reviewData?.reviewsThisMonth ?? 'Data Not Available'}</div>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="text-xs font-bold text-slate-500 uppercase">Last 90 Days</div>
            <div className="text-2xl font-black mt-1 text-slate-800">{reviewData?.reviewsLast90Days ?? 'Data Not Available'}</div>
          </div>
        </div>
      </SectionCard>

      {/* 5. COMPETITOR INTELLIGENCE */}
      <SectionCard title="5. Competitor Intelligence (Similarity Model)" noPadding>
        {competitors && competitors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Business Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Dist (km)</th>
                  <th className="p-4 font-bold">Rating</th>
                  <th className="p-4 font-bold">Reviews</th>
                  <th className="p-4 font-bold">Website</th>
                  <th className="p-4 font-bold text-right">Similarity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {competitors.map((comp: any, idx: number) => {
                  const log = competitorLogs?.find((l: any) => l.name === comp.name);
                  const score = log?.score || 100;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{comp.name}</td>
                      <td className="p-4 text-slate-600 capitalize">{comp.category}</td>
                      <td className="p-4 text-slate-600 font-medium">{comp.distanceKm}</td>
                      <td className="p-4 text-slate-800 font-bold">{comp.rating || '-'}</td>
                      <td className="p-4 text-slate-800 font-bold">{comp.reviewCount || '-'}</td>
                      <td className="p-4 text-blue-600 font-medium hover:underline">
                        {comp.website ? <a href={comp.website} target="_blank" rel="noreferrer">Yes</a> : 'No'}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          {score}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border-dashed border-b border-slate-200">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No Relevant Competitors Found</p>
            <p className="text-slate-500 text-sm mt-1">No businesses in the radius met the 70% Similarity Model threshold.</p>
          </div>
        )}

        {/* VALIDATION LOGS */}
        {competitorLogs && competitorLogs.length > 0 && (
          <div className="bg-slate-100 p-4 border-t border-slate-200">
            <details>
              <summary className="text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900">
                View Rejection Logs ({competitorLogs.filter((l:any)=>l.status==='REJECTED').length} Rejected)
              </summary>
              <div className="mt-4 bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase">
                      <th className="p-2 font-bold">Candidate</th>
                      <th className="p-2 font-bold">Category</th>
                      <th className="p-2 font-bold">Score</th>
                      <th className="p-2 font-bold">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {competitorLogs.filter((l:any)=>l.status === 'REJECTED').map((log: any, idx: number) => (
                      <tr key={idx} className="bg-red-50/20">
                        <td className="p-2 font-medium text-slate-800">{log.name}</td>
                        <td className="p-2 text-slate-600">{log.category}</td>
                        <td className="p-2 text-red-600 font-bold">{log.score}%</td>
                        <td className="p-2 text-slate-500">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}
      </SectionCard>

      {/* 6. COMPETITOR GAP ANALYSIS */}
      {competitorGapAnalysis && (
        <SectionCard title="6. Competitor Gap Analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Metrics Comparison</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Average Rating</span>
                  <div className="text-right">
                    <span className="block text-xs text-slate-500">You vs Top 10</span>
                    <span className="font-bold text-slate-900">{competitorGapAnalysis.targetMetrics.rating} vs {competitorGapAnalysis.competitorAverages.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Total Reviews</span>
                  <div className="text-right">
                    <span className="block text-xs text-slate-500">You vs Top 10 Avg</span>
                    <span className="font-bold text-slate-900">{competitorGapAnalysis.targetMetrics.reviews} vs {competitorGapAnalysis.competitorAverages.reviews}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Identified Gaps</h3>
              <ul className="space-y-2">
                {competitorGapAnalysis.gaps.map((gap: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
      )}

      {/* 7. SEO ANALYSIS */}
      <SectionCard title="7. SEO Analysis">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Top Local Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {seoAnalysis?.topLocalKeywords?.map((kw: string, i: number) => (
                <span key={i} className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm font-medium">
                  {kw}
                </span>
              )) || <span className="text-sm text-slate-500">Data Not Available</span>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Keyword Coverage</h3>
            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
              Coverage mapping requires authenticated GBP description text. <br/><span className="font-bold">Data Not Available.</span>
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 8. KEYWORD RANKINGS */}
      <SectionCard title="8. Keyword Rankings" noPadding>
        {rankTrackingConfigured && keywordData && keywordData.length > 0 ? (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Keyword</th>
                <th className="p-4 font-bold">Current Rank</th>
                <th className="p-4 font-bold">Change</th>
                <th className="p-4 font-bold">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {keywordData.map((kw: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">{kw.keyword}</td>
                  <td className="p-4 text-slate-900 font-black">{kw.currentRank}</td>
                  <td className="p-4">
                    {kw.change > 0 ? <span className="text-emerald-600 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> +{kw.change}</span> :
                     kw.change < 0 ? <span className="text-rose-600 flex items-center gap-1"><TrendingDown className="w-4 h-4"/> {kw.change}</span> :
                     <span className="text-slate-400 flex items-center gap-1"><Minus className="w-4 h-4"/> 0</span>}
                  </td>
                  <td className="p-4 text-slate-600">{kw.searchVolume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center bg-slate-50">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-slate-800 font-bold mb-1">Keyword Tracking Not Configured</p>
            <p className="text-slate-500 text-sm">Connect a Rank Tracking provider (DataForSEO, SerpAPI) to monitor local map pack positions.</p>
          </div>
        )}
      </SectionCard>

      {/* 9, 10, 11: OPPORTUNITIES, QUICK WINS, ACTION PLAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 10. QUICK WINS */}
        <SectionCard title="10. Quick Wins">
          <div className="space-y-4">
            {quickWins && quickWins.length > 0 ? quickWins.map((qw: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{qw.title}</h4>
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${qw.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                    {qw.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{qw.expectedImpact}</p>
                <div className="text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-bold">Evidence:</span> {qw.sourceEvidence}
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 italic">No critical quick wins identified.</p>
            )}
          </div>
        </SectionCard>

        {/* 11. 30 DAY ACTION PLAN */}
        <SectionCard title="11. 30-Day Action Plan" noPadding>
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((week) => (
              <div key={week} className="p-6">
                <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">Week {week}</h4>
                <ul className="space-y-2">
                  {actionPlan?.[`week${week}`]?.length > 0 ? (
                    actionPlan[`week${week}`].map((task: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{task}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-400 italic flex items-center gap-2">
                      <Minus className="w-4 h-4" /> No specific tasks scheduled.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

    </div>
  );
}
