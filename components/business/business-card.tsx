import Link from "next/link";

import {
  PresenceIndicator,
  RatingInline,
} from "@/components/business/business-meta";
import { ScoreBadge, ScoreBar } from "@/components/common/lead-score";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/data/categories";
import { getScoreTier, SCORE_MAX, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { Business } from "@/types";

interface BusinessCardProps {
  business: Business;
}

/** Versão em card dos resultados — usada no mobile e em grades. */
export function BusinessCard({ business }: BusinessCardProps) {
  const tier = getScoreTier(business.score);

  return (
    <article className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
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
            "font-heading text-lg font-medium tabular-nums",
            SCORE_TIER_STYLES[tier.id].text
          )}
        >
          {business.score}
          <span className="text-xs text-muted-foreground">/{SCORE_MAX}</span>
        </p>
      </div>

      <ScoreBar score={business.score} className="mt-3" />

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <RatingInline rating={business.rating} reviews={business.reviews} />
        <ScoreBadge score={business.score} short />
      </div>

      <dl className="mt-3.5 grid grid-cols-2 gap-2 border-t border-border pt-3.5 text-sm">
        <div className="flex items-center gap-2">
          <dt className="text-muted-foreground">Site</dt>
          <dd>
            <PresenceIndicator value={business.website} />
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-muted-foreground">Instagram</dt>
          <dd>
            <PresenceIndicator value={business.instagram} />
          </dd>
        </div>
      </dl>

      <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
        <Link href={`/empresas/${business.id}`}>Analisar</Link>
      </Button>
    </article>
  );
}
