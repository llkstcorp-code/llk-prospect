"use client";

import * as React from "react";
import Link from "next/link";
import { Target } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { FiltersBar } from "@/components/common/filters-bar";
import { PageHeader } from "@/components/common/page-header";
import { useToast } from "@/components/common/toast";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, getCategoryLabel } from "@/data/categories";
import { getServiceName, MOCK_SERVICES } from "@/data/mockServices";
import { LEAD_STATUSES } from "@/lib/constants";
import { useLeads } from "@/store/leads-store";
import { useProspecting } from "@/store/prospecting-store";
import type { Business, CategoryId, LeadStatus, ScoreTierId } from "@/types";

const ALL = "todos";

interface OpportunityFilters {
  tier: ScoreTierId | typeof ALL;
  category: CategoryId | typeof ALL;
  city: string;
  serviceId: string;
  status: LeadStatus | typeof ALL;
}

const DEFAULT_FILTERS: OpportunityFilters = {
  tier: ALL,
  category: ALL,
  city: ALL,
  serviceId: ALL,
  status: ALL,
};

export default function OpportunitiesPage() {
  const { toast } = useToast();
  const { findByBusinessId, addLead } = useLeads();
  const { businesses: discoveredBusinesses } = useProspecting();
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const businesses = React.useMemo(
    () => discoveredBusinesses.filter((business) => business.score >= 70),
    [discoveredBusinesses]
  );

  const cities = React.useMemo(
    () => [...new Set(businesses.map((business) => business.city))].sort(),
    [businesses]
  );

  function getStatus(business: Business): LeadStatus {
    return findByBusinessId(business.id)?.status ?? "novo";
  }

  const visible = businesses.filter((business) => {
    if (filters.tier !== ALL) {
      const isExcellent = business.score >= 85;
      if (filters.tier === "excelente" && !isExcellent) return false;
      if (filters.tier === "boa" && isExcellent) return false;
    }
    if (filters.category !== ALL && business.category !== filters.category) {
      return false;
    }
    if (filters.city !== ALL && business.city !== filters.city) return false;
    if (
      filters.serviceId !== ALL &&
      business.recommendedServiceId !== filters.serviceId
    ) {
      return false;
    }
    if (filters.status !== ALL && getStatus(business) !== filters.status) {
      return false;
    }
    return true;
  });

  const activeCount = Object.values(filters).filter(
    (value) => value !== ALL
  ).length;

  async function handleAddLead(business: Business) {
    setPendingId(business.id);
    try {
      await addLead(business.id);
      toast({
        title: "Oportunidade adicionada aos leads",
        description: `${business.name} está na etapa Novo do seu CRM.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Não foi possível adicionar o lead",
        variant: "error",
      });
    } finally {
      setPendingId(null);
    }
  }

  function update<K extends keyof OpportunityFilters>(
    key: K,
    value: OpportunityFilters[K]
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oportunidades"
        description="Empresas com maior potencial de contratar os serviços da LLK."
        actions={
          <FiltersBar
            activeCount={activeCount}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          >
            <Select
              value={filters.tier}
              onValueChange={(value) =>
                update("tier", value as OpportunityFilters["tier"])
              }
            >
              <SelectTrigger size="sm" className="w-[10.5rem]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os scores</SelectItem>
                <SelectItem value="excelente">Excelente (85+)</SelectItem>
                <SelectItem value="boa">Boa (70–84)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) =>
                update("category", value as OpportunityFilters["category"])
              }
            >
              <SelectTrigger size="sm" className="w-[10.5rem]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as categorias</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.city}
              onValueChange={(value) => update("city", value)}
            >
              <SelectTrigger size="sm" className="w-[9.5rem]">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as cidades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.serviceId}
              onValueChange={(value) => update("serviceId", value)}
            >
              <SelectTrigger size="sm" className="w-[11.5rem]">
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os serviços</SelectItem>
                {MOCK_SERVICES.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                update("status", value as OpportunityFilters["status"])
              }
            >
              <SelectTrigger size="sm" className="w-[9.5rem]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os status</SelectItem>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FiltersBar>
        }
      />

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title={
              businesses.length === 0
                ? "Nenhuma oportunidade identificada"
                : "Nenhuma oportunidade com esses filtros"
            }
            description={
              businesses.length === 0
                ? "Faça uma busca de empresas para identificar oportunidades com maior potencial."
                : "Ajuste os critérios acima para ver outras empresas com potencial na sua região."
            }
            action={
              businesses.length === 0 ? (
                <Button asChild>
                  <Link href="/empresas/buscar">Encontrar empresas</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  Limpar filtros
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {visible.length}{" "}
            {visible.length === 1
              ? "oportunidade encontrada"
              : "oportunidades encontradas"}
            {filters.category !== ALL
              ? ` · ${getCategoryLabel(filters.category)}`
              : ""}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((business) => (
              <OpportunityCard
                key={business.id}
                business={business}
                serviceName={getServiceName(business.recommendedServiceId)}
                status={getStatus(business)}
                isInCrm={Boolean(findByBusinessId(business.id))}
                isPending={pendingId === business.id}
                onAddLead={() => void handleAddLead(business)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
