"use client";

import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import type { Deal } from "@/types";

const CLOSED: Deal["status"][] = ["fechado", "perdido"];

interface DealsOfBusinessCardProps {
  deals: Deal[];
  onOpenDeal: () => void;
  className?: string;
}

/**
 * Histórico comercial da empresa.
 *
 * Uma empresa pode ter vários negócios ao longo do tempo — o site, a renovação,
 * o sistema. Encerrados aparecem esmaecidos, porque o que importa no dia a dia
 * é o que está em aberto.
 */
export function DealsOfBusinessCard({
  deals,
  onOpenDeal,
  className,
}: DealsOfBusinessCardProps) {
  const open = deals.filter((deal) => !CLOSED.includes(deal.status));
  const closed = deals.filter((deal) => CLOSED.includes(deal.status));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          Negócios
          {deals.length > 0 ? (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {open.length} em aberto
            </span>
          ) : null}
        </CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={onOpenDeal}>
            <Plus data-icon="inline-start" />
            Abrir
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {deals.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Nenhum negócio com esta empresa"
            description="Abra um negócio para acompanhar a negociação no funil, do primeiro contato ao fechamento."
            action={
              <Button variant="outline" size="sm" onClick={onOpenDeal}>
                <Plus data-icon="inline-start" />
                Abrir negócio
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {[...open, ...closed].map((deal) => {
              const isClosed = CLOSED.includes(deal.status);
              return (
                <li key={deal.id}>
                  <Link
                    href={`/negocios/${deal.id}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 transition-colors outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="min-w-0 space-y-1">
                      <p
                        className={
                          isClosed ? "font-medium text-muted-foreground" : "font-medium"
                        }
                      >
                        {deal.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.serviceName}
                        {deal.contactName ? ` · ${deal.contactName}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isClosed && deal.closedAt
                          ? `Encerrado ${formatRelativeDate(deal.closedAt)}`
                          : `Aberto ${formatRelativeDate(deal.createdAt)}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={deal.status} />
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(deal.estimatedValue)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
