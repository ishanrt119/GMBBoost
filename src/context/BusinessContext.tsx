"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEV_CONTEXT } from "@/lib/dev-context";

interface Business {
  _id: string;
  name: string;
  category?: string;
  address?: string;
  organizationId: string;
  googleConnected: boolean;
  whatsappConfig?: {
    isConnected: boolean;
    businessPhone?: string;
  };
}

interface BusinessContextType {
  businesses: Business[];
  activeBusiness: Business | null;
  loading: boolean;
  switchBusiness: (businessId: string) => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/business/active');
      const json = await res.json();
      if (json.success && json.data) {
        setBusinesses([json.data]);
        setActiveBusiness(json.data);
      } else {
        // Fallback to dummy data if no cookie exists (user hasn't onboarded yet)
        const fallback = {
          _id: DEV_CONTEXT.businessId,
          name: "Acme Development (Fallback)",
          organizationId: DEV_CONTEXT.organizationId,
          googleConnected: false,
        };
        setBusinesses([fallback]);
        setActiveBusiness(fallback);
      }
    } catch (err) {
      console.error("Failed to load business context", err);
      // Fallback on network error
      const fallback = {
        _id: DEV_CONTEXT.businessId,
        name: "Acme Development (Fallback)",
        organizationId: DEV_CONTEXT.organizationId,
        googleConnected: false,
      };
      setBusinesses([fallback]);
      setActiveBusiness(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const switchBusiness = async (businessId: string) => {
    const selected = businesses.find(b => b._id === businessId);
    if (selected) {
      setActiveBusiness(selected);
      router.refresh();
    }
  };

  return (
    <BusinessContext.Provider value={{ businesses, activeBusiness, loading, switchBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
