"use client";

import Link from "next/link";
import { Loader2, Plus } from "lucide-react";

import { ScoreBadge, ScoreBar } from "@/components/common/lead-score";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/data/categories";
import { formatCurrency } from "@/lib/format";
import { getScoreTier, SCORE_MAX, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { Business, LeadStatus } from "@/types";

interface OpportunityCardProps {
  business: Business;
  serviceName: string;
  status: LeadStatus;
  isInCrm: boolean;
  isPending: boolean;
  onAddLead: () => void;
}

export function OpportunityCard({
  business,
  serviceName,
  status,
  isInCrm,
  isPending,
  onAddLead,
}: OpportunityCardProps) {
  const tier = getScoreTier(business.score);

  return (
    <article className="flex flex-col rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{business.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getCategoryLabel(business.category)} · {business.city},{" "}
            {business.state}
          </p>
        </div>
        <p
          className={cn(
            "font-heading text-xl font-medium tabular-nums",
            SCORE_TIER_STYLES[tier.id].text
          )}
        >
          {business.score}
          <span className="text-xs text-muted-foreground">/{SCORE_MAX}</span>
        </p>
      </div>

      <ScoreBar score={business.score} className="mt-3" />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ScoreBadge score={business.score} short />
        <StatusBadge status={status} />
      </div>

      <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">Problema</dt>
          <dd className="text-right">{business.problem}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">Serviço</dt>
          <dd className="text-right">{serviceName}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">Valor estimado</dt>
          <dd className="text-right font-medium">
            {formatCurrency(business.estimatedValue)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/empresas/${business.id}`}>Ver oportunidade</Link>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={onAddLead}
          disabled={isInCrm || isPending}
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Plus data-icon="inline-start" />
          )}
          {isInCrm ? "No CRM" : "Adicionar"}
        </Button>
      </div>
    </article>
  );
}
