"use client";

import Link from "next/link";
import { Kanban } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { useToast } from "@/components/common/toast";
import { KanbanBoard } from "@/components/deals/kanban-board";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDealStatusConfig, LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { useDeals } from "@/store/deals-store";
import type { Deal, DealStatus } from "@/types";

export default function CrmPage() {
  const { deals, isLoading, changeStatus } = useDeals();
  const { toast } = useToast();

  const openValue = deals
    .filter((deal) => deal.status !== "perdido" && deal.status !== "fechado")
    .reduce((total, deal) => total + deal.estimatedValue, 0);

  async function handleStatusChange(deal: Deal, status: DealStatus) {
    try {
      await changeStatus(deal.id, status);
      toast({
        title: `${deal.businessName} movido para ${getDealStatusConfig(status).label}`,
        variant: "success",
      });
    } catch {
      toast({ title: "Não foi possível mover o negócio", variant: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Acompanhe cada negócio da primeira abordagem até o fechamento."
        actions={
          <Button variant="outline" asChild>
            <Link href="/negocios">Ver todos os negócios</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {LEAD_STATUSES.map((status) => (
            <Skeleton key={status.id} className="h-72 w-[17rem] shrink-0" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Kanban}
            title="Nenhum negócio no funil"
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
            {deals.length} {deals.length === 1 ? "negócio" : "negócios"} no funil ·{" "}
            {formatCurrency(openValue)} em negociações abertas
          </p>
          <KanbanBoard
            deals={deals}
            onStatusChange={(deal, status) =>
              void handleStatusChange(deal, status)
            }
          />
        </>
      )}
    </div>
  );
}
