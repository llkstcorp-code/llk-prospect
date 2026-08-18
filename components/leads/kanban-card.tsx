"use client";

import Link from "next/link";
import { GripVertical, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

interface KanbanCardProps {
  lead: Lead;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onStatusChange: (status: LeadStatus) => void;
}

export function KanbanCard({
  lead,
  isDragging,
  onDragStart,
  onDragEnd,
  onStatusChange,
}: KanbanCardProps) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", lead.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group/card cursor-grab rounded-lg bg-background p-3 ring-1 ring-foreground/10 transition-shadow hover:shadow-sm active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <Link
          href={`/leads/${lead.id}`}
          className="min-w-0 text-sm font-medium hover:underline"
        >
          {lead.businessName}
        </Link>
        <div className="flex shrink-0 items-center">
          <GripVertical
            aria-hidden
            className="size-3.5 text-muted-foreground/40 lg:group-hover/card:text-muted-foreground"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Mover lead">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Mover para</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LEAD_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status.id}
                  disabled={status.id === lead.status}
                  onSelect={() => onStatusChange(status.id)}
                >
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className={cn(
            "font-medium tabular-nums",
            SCORE_TIER_STYLES[getScoreTier(lead.score).id].text
          )}
        >
          Score {lead.score}
        </span>
        · {lead.serviceName}
      </p>

      <p className="mt-2.5 font-medium tabular-nums">
        {formatCurrency(lead.estimatedValue)}
      </p>

      <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
        Último contato: {formatRelativeDate(lead.lastContactAt)}
      </p>
    </article>
  );
}
