"use client";

import * as React from "react";

import { getBusinesses } from "@/services/businesses";
import type { Business } from "@/types";

interface ProspectingContextValue {
  businesses: Business[];
  searchesCount: number;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  registerSearch: (businesses: Business[]) => void;
}

const ProspectingContext = React.createContext<ProspectingContextValue | null>(
  null
);

/** Cache de interface para as empresas persistidas no Supabase. */
export function ProspectingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [searchesCount, setSearchesCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getBusinesses();
        if (active) setBusinesses(result);
      } catch {
        if (active) {
          setError("Não foi possível carregar as empresas encontradas.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const reload = React.useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const registerSearch = React.useCallback((results: Business[]) => {
    setSearchesCount((count) => count + 1);
    setBusinesses((current) => {
      const byId = new Map(current.map((business) => [business.id, business]));
      results.forEach((business) => byId.set(business.id, business));
      return [...byId.values()];
    });
  }, []);

  const value = React.useMemo(
    () => ({
      businesses,
      searchesCount,
      isLoading,
      error,
      reload,
      registerSearch,
    }),
    [businesses, searchesCount, isLoading, error, reload, registerSearch]
  );

  return (
    <ProspectingContext.Provider value={value}>
      {children}
    </ProspectingContext.Provider>
  );
}

export function useProspecting(): ProspectingContextValue {
  const context = React.useContext(ProspectingContext);
  if (!context) {
    throw new Error(
      "useProspecting precisa estar dentro de <ProspectingProvider>."
    );
  }
  return context;
}
