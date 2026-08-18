"use client";

import Link from "next/link";
import { Kanban } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { useToast } from "@/components/common/toast";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeadStatusConfig, LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { useLeads } from "@/store/leads-store";
import type { Lead, LeadStatus } from "@/types";

export default function CrmPage() {
  const { leads, isLoading, changeStatus } = useLeads();
  const { toast } = useToast();

  const openValue = leads
    .filter((lead) => lead.status !== "perdido" && lead.status !== "fechado")
    .reduce((total, lead) => total + lead.estimatedValue, 0);

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    try {
      await changeStatus(lead.id, status);
      toast({
        title: `${lead.businessName} movido para ${getLeadStatusConfig(status).label}`,
        variant: "success",
      });
    } catch {
      toast({ title: "Não foi possível mover o lead", variant: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Acompanhe cada lead da primeira abordagem até o fechamento."
        actions={
          <Button variant="outline" asChild>
            <Link href="/leads">Ver lista de leads</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {LEAD_STATUSES.map((status) => (
            <Skeleton key={status.id} className="h-72 w-[17rem] shrink-0" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <EmptyState
            icon={Kanban}
            title="Nenhum lead no CRM"
            description="Adicione uma empresa à sua prospecção para começar a acompanhar as etapas comerciais."
            action={
              <Button asChild>
                <Link href="/empresas/buscar">Encontrar empresas</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {leads.length} {leads.length === 1 ? "lead" : "leads"} no funil ·{" "}
            {formatCurrency(openValue)} em negociações abertas
          </p>
          <KanbanBoard
            leads={leads}
            onStatusChange={(lead, status) =>
              void handleStatusChange(lead, status)
            }
          />
        </>
      )}
    </div>
  );
}
