"use client";

import * as React from "react";

import * as leadsService from "@/services/leads";
import type { Lead, LeadStatus } from "@/types";

interface LeadsContextValue {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  findByBusinessId: (businessId: string) => Lead | undefined;
  addLead: (businessId: string) => Promise<Lead>;
  changeStatus: (leadId: string, status: LeadStatus) => Promise<Lead>;
  addNote: (leadId: string, content: string) => Promise<Lead>;
  registerContact: (leadId: string) => Promise<Lead>;
}

const LeadsContext = React.createContext<LeadsContextValue | null>(null);

/**
 * Estado compartilhado dos leads. Mantém CRM, Leads e página da empresa
 * sincronizados sem que cada tela precise recarregar a lista inteira.
 */
export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = React.useState<Lead[]>([]);
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
        const result = await leadsService.getLeads();
        if (active) setLeads(result);
      } catch {
        if (active) setError("Não foi possível carregar seus leads.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const replaceLead = React.useCallback((updated: Lead) => {
    setLeads((current) =>
      current.some((lead) => lead.id === updated.id)
        ? current.map((lead) => (lead.id === updated.id ? updated : lead))
        : [updated, ...current]
    );
  }, []);

  const value = React.useMemo<LeadsContextValue>(
    () => ({
      leads,
      isLoading,
      error,
      reload,
      findByBusinessId: (businessId) =>
        leads.find((lead) => lead.businessId === businessId),
      addLead: async (businessId) => {
        const lead = await leadsService.createLead(businessId);
        replaceLead(lead);
        return lead;
      },
      changeStatus: async (leadId, status) => {
        const lead = await leadsService.updateLeadStatus(leadId, status);
        replaceLead(lead);
        return lead;
      },
      addNote: async (leadId, content) => {
        const lead = await leadsService.addLeadNote(leadId, content);
        replaceLead(lead);
        return lead;
      },
      registerContact: async (leadId) => {
        const lead = await leadsService.registerLeadContact(leadId);
        replaceLead(lead);
        return lead;
      },
    }),
    [leads, isLoading, error, reload, replaceLead]
  );

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
}

export function useLeads(): LeadsContextValue {
  const context = React.useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads precisa estar dentro de <LeadsProvider>.");
  }
  return context;
}
