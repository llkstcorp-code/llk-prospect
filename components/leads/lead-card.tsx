"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/data/categories";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types";

interface LeadCardProps {
  lead: Lead;
}

/** Versão em card da lista de leads — usada no mobile. */
export function LeadCard({ lead }: LeadCardProps) {
  return (
    <article className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{lead.businessName}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getCategoryLabel(lead.category)} · {lead.city}, {lead.state}
          </p>
        </div>
        <span
          className={cn(
            "font-heading text-lg font-medium tabular-nums",
            SCORE_TIER_STYLES[getScoreTier(lead.score).id].text
          )}
        >
          {lead.score}
        </span>
      </div>

      <div className="mt-3">
        <StatusBadge status={lead.status} />
      </div>

      <dl className="mt-3.5 space-y-2 border-t border-border pt-3.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Serviço</dt>
          <dd className="text-right">{lead.serviceName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Valor potencial</dt>
          <dd className="text-right font-medium">
            {formatCurrency(lead.estimatedValue)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Último contato</dt>
          <dd className="text-right">{formatRelativeDate(lead.lastContactAt)}</dd>
        </div>
      </dl>

      <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
        <Link href={`/leads/${lead.id}`}>
          Ver detalhes
          <ChevronRight data-icon="inline-end" />
        </Link>
      </Button>
    </article>
  );
}
