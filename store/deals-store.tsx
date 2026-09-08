"use client";

import * as React from "react";

import * as dealsService from "@/services/deals";
import type { Deal, DealInput, DealStatus } from "@/types";

interface DealsContextValue {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  /** Todos os negócios de uma empresa — pode haver mais de um. */
  dealsOfBusiness: (businessId: string) => Deal[];
  /** O negócio em aberto da empresa, se houver algum. */
  openDealOfBusiness: (businessId: string) => Deal | undefined;
  addDeal: (input: DealInput) => Promise<Deal>;
  changeStatus: (dealId: string, status: DealStatus) => Promise<Deal>;
  addNote: (dealId: string, content: string) => Promise<Deal>;
  registerContact: (dealId: string) => Promise<Deal>;
}

const DealsContext = React.createContext<DealsContextValue | null>(null);

/**
 * Estado compartilhado dos negócios. Mantém CRM, lista e ficha da empresa
 * sincronizados sem que cada tela precise recarregar a lista inteira.
 */
export function DealsProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [reloadToken, setReloadToken] = React.useState(0);

  const reload = React.useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  React.useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await dealsService.getDeals();
        if (active) setDeals(result);
      } catch {
        if (active) setError("Não foi possível carregar os negócios.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const replaceDeal = React.useCallback((updated: Deal) => {
    setDeals((current) =>
      current.some((deal) => deal.id === updated.id)
        ? current.map((deal) => (deal.id === updated.id ? updated : deal))
        : [updated, ...current]
    );
  }, []);

  const value = React.useMemo<DealsContextValue>(
    () => ({
      deals,
      isLoading,
      error,
      reload,
      dealsOfBusiness: (businessId) =>
        deals.filter((deal) => deal.businessId === businessId),
      openDealOfBusiness: (businessId) =>
        deals.find(
          (deal) =>
            deal.businessId === businessId &&
            deal.status !== "fechado" &&
            deal.status !== "perdido"
        ),
      addDeal: async (input) => {
        const deal = await dealsService.createDeal(input);
        replaceDeal(deal);
        return deal;
      },
      changeStatus: async (dealId, status) => {
        const deal = await dealsService.updateDealStatus(dealId, status);
        replaceDeal(deal);
        return deal;
      },
      addNote: async (dealId, content) => {
        const deal = await dealsService.addDealNote(dealId, content);
        replaceDeal(deal);
        return deal;
      },
      registerContact: async (dealId) => {
        const deal = await dealsService.registerDealContact(dealId);
        replaceDeal(deal);
        return deal;
      },
    }),
    [deals, isLoading, error, reload, replaceDeal]
  );

  return (
    <DealsContext.Provider value={value}>{children}</DealsContext.Provider>
  );
}

export function useDeals(): DealsContextValue {
  const context = React.useContext(DealsContext);
  if (!context) {
    throw new Error("useDeals precisa estar dentro de <DealsProvider>.");
  }
  return context;
}
