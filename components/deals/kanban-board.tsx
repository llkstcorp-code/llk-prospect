"use client";

import * as React from "react";

import { KanbanCard } from "@/components/deals/kanban-card";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Deal, DealStatus } from "@/types";

interface KanbanBoardProps {
  deals: Deal[];
  onStatusChange: (deal: Deal, status: DealStatus) => void;
}

/**
 * Quadro do CRM. Os cards podem ser arrastados entre as colunas no desktop e
 * movidos pelo menu do card em qualquer tela.
 */
export function KanbanBoard({ deals, onStatusChange }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DealStatus | null>(null);

  function handleDrop(status: DealStatus) {
    const deal = deals.find((item) => item.id === draggingId);
    setDraggingId(null);
    setDropTarget(null);
    if (deal && deal.status !== status) {
      onStatusChange(deal, status);
    }
  }

  return (
    <div className="scrollbar-slim -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <div className="flex min-w-max gap-4">
        {LEAD_STATUSES.map((status) => {
          const columnDeals = deals.filter((deal) => deal.status === status.id);
          const total = columnDeals.reduce(
            (sum, deal) => sum + deal.estimatedValue,
            0
          );
          const isTarget = dropTarget === status.id;

          return (
            <section
              key={status.id}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropTarget(status.id);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setDropTarget((current) =>
                    current === status.id ? null : current
                  );
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(status.id);
              }}
              className={cn(
                "flex w-[17rem] shrink-0 flex-col rounded-xl bg-muted/50 transition-colors",
                isTarget && "bg-brand-surface ring-1 ring-brand/30"
              )}
            >
              <header className="flex items-baseline justify-between gap-2 px-3.5 pt-3.5">
                <h2 className="flex items-center gap-2 text-sm font-medium">
                  {status.label}
                  <span className="rounded-full bg-background px-1.5 text-xs text-muted-foreground tabular-nums">
                    {columnDeals.length}
                  </span>
                </h2>
                {total > 0 ? (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatCurrency(total)}
                  </span>
                ) : null}
              </header>

              <div className="flex min-h-40 flex-1 flex-col gap-2.5 p-3">
                {columnDeals.map((deal) => (
                  <KanbanCard
                    key={deal.id}
                    deal={deal}
                    isDragging={draggingId === deal.id}
                    onDragStart={() => setDraggingId(deal.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDropTarget(null);
                    }}
                    onStatusChange={(next) => onStatusChange(deal, next)}
                  />
                ))}

                {columnDeals.length === 0 ? (
                  <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    {status.description}
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
