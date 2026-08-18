"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Handshake,
  Percent,
  Search,
  Send,
  Target,
} from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { StatsSkeleton } from "@/components/common/loading-state";
import { StatCard } from "@/components/common/stat-card";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { LeadsChart } from "@/components/dashboard/leads-chart";
import { PriorityOpportunities } from "@/components/dashboard/priority-opportunities";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLeads } from "@/store/leads-store";
import { useProspecting } from "@/store/prospecting-store";
import type { ChartPoint, FunnelStage } from "@/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function buildHistory(dates: string[]): ChartPoint[] {
  const counts = new Map<string, number>();
  dates.forEach((date) => {
    const day = date.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export default function DashboardPage() {
  const { businesses, isLoading: isLoadingBusinesses } = useProspecting();
  const { leads, isLoading: isLoadingLeads } = useLeads();
  const isLoading = isLoadingBusinesses || isLoadingLeads;
  const [greeting] = React.useState(getGreeting);

  const opportunities = businesses
    .filter((business) => business.score >= 70)
    .sort((a, b) => b.score - a.score);
  const contacted = leads.filter((lead) => Boolean(lead.lastContactAt)).length;
  const replied = leads.filter((lead) =>
    ["respondeu", "reuniao", "proposta", "fechado"].includes(lead.status)
  ).length;
  const proposals = leads.filter((lead) =>
    ["proposta", "fechado"].includes(lead.status)
  ).length;
  const closed = leads.filter((lead) => lead.status === "fechado").length;
  const conversion = businesses.length
    ? Math.round((closed / businesses.length) * 100)
    : 0;
  const hasData = businesses.length > 0 || leads.length > 0;

  const funnel: FunnelStage[] = [
    { id: "encontrados", label: "Encontrados", value: businesses.length },
    { id: "contatados", label: "Contatados", value: contacted },
    { id: "responderam", label: "Responderam", value: replied },
    { id: "proposta", label: "Proposta", value: proposals },
    { id: "fechados", label: "Fechados", value: closed },
  ];
  const history = buildHistory(businesses.map((business) => business.foundAt));

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          {greeting}
        </h1>
        <p className="text-sm text-muted-foreground">
          Veja como está sua prospecção hoje.
        </p>
      </header>

      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Empresas encontradas" value={businesses.length} trendLabel="" trend="neutral" icon={Building2} />
            <StatCard label="Oportunidades" value={opportunities.length} trendLabel="" trend="neutral" icon={Target} />
            <StatCard label="Leads contatados" value={contacted} trendLabel="" trend="neutral" icon={Send} />
            <StatCard label="Negócios fechados" value={closed} trendLabel="" trend="neutral" icon={Handshake} />
            <StatCard label="Taxa de conversão" value={conversion} valueSuffix="%" trendLabel="" trend="neutral" icon={Percent} />
          </section>

          {!hasData ? (
            <Card>
              <EmptyState
                icon={Search}
                title="Ainda não existem dados de prospecção"
                description="Comece encontrando empresas na sua região para identificar novas oportunidades."
                action={
                  <Button asChild>
                    <Link href="/empresas/buscar">Encontrar empresas</Link>
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              <section className="grid gap-6 xl:grid-cols-3">
                <Card className="[--card-spacing:--spacing(5)] xl:col-span-2">
                  <CardHeader>
                    <CardTitle>Empresas encontradas ao longo do tempo</CardTitle>
                    <CardDescription>Histórico real das empresas encontradas.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {history.length >= 2 ? (
                      <LeadsChart data={history} />
                    ) : (
                      <p className="py-16 text-center text-sm text-muted-foreground">
                        Ainda não há histórico suficiente para exibir o gráfico.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="[--card-spacing:--spacing(5)]">
                  <CardHeader>
                    <CardTitle>Conversão de leads</CardTitle>
                    <CardDescription>Do resultado encontrado ao negócio fechado.</CardDescription>
                  </CardHeader>
                  <CardContent><ConversionFunnel stages={funnel} /></CardContent>
                </Card>
              </section>

              {opportunities.length > 0 ? (
                <Card className="[--card-spacing:--spacing(5)] gap-0">
                  <CardHeader className="pb-5">
                    <CardTitle>Oportunidades prioritárias</CardTitle>
                    <CardDescription>Melhores empresas encontradas nas suas buscas.</CardDescription>
                    <CardAction>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/oportunidades">Ver todas<ArrowRight data-icon="inline-end" /></Link>
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="border-t border-border px-0">
                    <PriorityOpportunities businesses={opportunities.slice(0, 4)} />
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
