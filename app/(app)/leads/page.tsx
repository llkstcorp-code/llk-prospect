"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { FiltersBar } from "@/components/common/filters-bar";
import { TableSkeleton } from "@/components/common/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { useToast } from "@/components/common/toast";
import { LeadCard } from "@/components/leads/lead-card";
import { LeadsTable } from "@/components/leads/leads-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/data/categories";
import { getLeadStatusConfig, LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { useLeads } from "@/store/leads-store";
import type { CategoryId, Lead, LeadStatus } from "@/types";

const ALL = "todos";

type ScoreFilter = typeof ALL | "excelente" | "boa" | "abaixo";

interface LeadFilters {
  status: LeadStatus | typeof ALL;
  category: CategoryId | typeof ALL;
  score: ScoreFilter;
}

const DEFAULT_FILTERS: LeadFilters = {
  status: ALL,
  category: ALL,
  score: ALL,
};

function matchesScore(score: number, filter: ScoreFilter): boolean {
  if (filter === "excelente") return score >= 85;
  if (filter === "boa") return score >= 70 && score < 85;
  if (filter === "abaixo") return score < 70;
  return true;
}

export default function LeadsPage() {
  const { leads, isLoading, changeStatus } = useLeads();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);

  const query = search.trim().toLocaleLowerCase("pt-BR");
  const visible = leads.filter((lead) => {
    if (query && !lead.businessName.toLocaleLowerCase("pt-BR").includes(query)) {
      return false;
    }
    if (filters.status !== ALL && lead.status !== filters.status) return false;
    if (filters.category !== ALL && lead.category !== filters.category) {
      return false;
    }
    return matchesScore(lead.score, filters.score);
  });

  const totalValue = visible.reduce(
    (total, lead) => total + lead.estimatedValue,
    0
  );

  const activeCount = Object.values(filters).filter(
    (value) => value !== ALL
  ).length;

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    try {
      await changeStatus(lead.id, status);
      toast({
        title: "Etapa atualizada",
        description: `${lead.businessName} foi movido para ${getLeadStatusConfig(status).label}.`,
        variant: "success",
      });
    } catch {
      toast({ title: "Não foi possível atualizar a etapa", variant: "error" });
    }
  }

  function update<K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Todas as empresas que você adicionou à sua carteira."
        actions={
          <Button variant="outline" asChild>
            <Link href="/empresas/buscar">Encontrar empresas</Link>
          </Button>
        }
      />

      {!isLoading && leads.length > 0 ? (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome da empresa"
            aria-label="Buscar leads por nome"
            className="pl-8"
          />
        </div>

        <FiltersBar
          activeCount={activeCount}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        >
          <Select
            value={filters.status}
            onValueChange={(value) =>
              update("status", value as LeadFilters["status"])
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

          <Select
            value={filters.category}
            onValueChange={(value) =>
              update("category", value as LeadFilters["category"])
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
            value={filters.score}
            onValueChange={(value) => update("score", value as ScoreFilter)}
          >
            <SelectTrigger size="sm" className="w-[10.5rem]">
              <SelectValue placeholder="Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os scores</SelectItem>
              <SelectItem value="excelente">Excelente (85+)</SelectItem>
              <SelectItem value="boa">Boa (70–84)</SelectItem>
              <SelectItem value="abaixo">Abaixo de 70</SelectItem>
            </SelectContent>
          </Select>
        </FiltersBar>
      </div>
      ) : null}

      {isLoading ? (
        <Card className="[--card-spacing:0px]">
          <TableSkeleton rows={6} columns={6} />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={
              leads.length === 0
                ? "Nenhum lead cadastrado"
                : "Nenhum lead com esses filtros"
            }
            description={
              leads.length === 0
                ? "As empresas que você adicionar à sua prospecção aparecerão aqui."
                : "Ajuste a busca ou os filtros para encontrar os leads que você procura."
            }
            action={
              leads.length === 0 ? (
                <Button asChild>
                  <Link href="/empresas/buscar">Encontrar empresas</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS);
                    setSearch("");
                  }}
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
            {visible.length} {visible.length === 1 ? "lead" : "leads"} ·{" "}
            {formatCurrency(totalValue)} em potencial
          </p>

          <Card className="hidden [--card-spacing:0px] lg:block">
            <LeadsTable
              leads={visible}
              onStatusChange={(lead, status) =>
                void handleStatusChange(lead, status)
              }
            />
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {visible.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
