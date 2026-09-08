"use client";

import * as React from "react";

import type { ServiceCatalog } from "@/lib/service-catalog";
import { API_ENDPOINTS } from "@/services/api";
import type { ServiceOffering } from "@/types";

interface ServicesContextValue {
  catalog: ServiceCatalog;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

const ServicesContext = React.createContext<ServicesContextValue | null>(null);

const EMPTY: ServiceCatalog = [];

/**
 * Catálogo de serviços para a interface, sempre vindo de `/api/services`.
 *
 * Existe para que nenhuma tela precise importar o catálogo de um arquivo
 * estático: o que aparece nos filtros, nas recomendações e nas análises é o
 * mesmo que está no banco e é editado em /configuracoes.
 */
export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = React.useState<ServiceCatalog>(EMPTY);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_ENDPOINTS.services, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(String(response.status));
        const result = (await response.json()) as ServiceOffering[];
        if (active) setCatalog(result);
      } catch {
        if (active) setError("Não foi possível carregar o catálogo de serviços.");
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

  const value = React.useMemo<ServicesContextValue>(
    () => ({ catalog, isLoading, error, reload }),
    [catalog, isLoading, error, reload]
  );

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): ServicesContextValue {
  const context = React.useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices precisa estar dentro de <ServicesProvider>.");
  }
  return context;
}
