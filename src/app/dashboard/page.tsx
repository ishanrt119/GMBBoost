'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import ChartsSection from '@/components/dashboard/ChartsSection';
import QuickPanels from '@/components/dashboard/QuickPanels';

export default function CommandCenter() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // In production, grab from auth context
  const businessId = '60b9b3b3b3b3b3b3b3b3b3b3'; 

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    
    try {
      const res = await fetch(`/api/dashboard/stats?businessId=${businessId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Loading Command Center...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 text-center text-slate-500">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 pt-10">
      <div className="max-w-[1600px] mx-auto">
        <DashboardHeader 
          businessName="Demo Business" 
          onRefresh={() => fetchStats(true)} 
          lastRefreshed={lastRefreshed}
          isRefreshing={refreshing}
        />
        
        <MetricsGrid metrics={data.metrics} />
        
        <ChartsSection charts={data.charts} />
        
        <QuickPanels panels={data.panels} />
      </div>
    </div>
  );
}
