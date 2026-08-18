"use client";

import * as React from "react";

import { KanbanCard } from "@/components/leads/kanban-card";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
}

/**
 * Quadro do CRM. Os cards podem ser arrastados entre as colunas no desktop e
 * movidos pelo menu do card em qualquer tela.
 */
export function KanbanBoard({ leads, onStatusChange }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<LeadStatus | null>(null);

  function handleDrop(status: LeadStatus) {
    const lead = leads.find((item) => item.id === draggingId);
    setDraggingId(null);
    setDropTarget(null);
    if (lead && lead.status !== status) {
      onStatusChange(lead, status);
    }
  }

  return (
    <div className="scrollbar-slim -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <div className="flex min-w-max gap-4">
        {LEAD_STATUSES.map((status) => {
          const columnLeads = leads.filter((lead) => lead.status === status.id);
          const total = columnLeads.reduce(
            (sum, lead) => sum + lead.estimatedValue,
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
                    {columnLeads.length}
                  </span>
                </h2>
                {total > 0 ? (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatCurrency(total)}
                  </span>
                ) : null}
              </header>

              <div className="flex min-h-40 flex-1 flex-col gap-2.5 p-3">
                {columnLeads.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    isDragging={draggingId === lead.id}
                    onDragStart={() => setDraggingId(lead.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDropTarget(null);
                    }}
                    onStatusChange={(next) => onStatusChange(lead, next)}
                  />
                ))}

                {columnLeads.length === 0 ? (
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
