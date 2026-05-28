"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEV_CONTEXT } from "@/lib/dev-context";

interface Business {
  _id: string;
  name: string;
  organizationId: string;
  googleConnected: boolean;
  integrations?: {
    whatsappNumber?: string;
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
  
  const [businesses, setBusinesses] = useState<Business[]>([
    {
      _id: DEV_CONTEXT.businessId,
      name: "Acme Development",
      organizationId: DEV_CONTEXT.organizationId,
      googleConnected: false,
    }
  ]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(businesses[0]);
  const [loading, setLoading] = useState(false);

  const fetchBusinesses = async () => {
    // dummy bypass
  };

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
