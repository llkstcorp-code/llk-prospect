import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { RatingInline } from "@/components/business/business-meta";
import { ScoreBadge } from "@/components/common/lead-score";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/data/categories";
import { SCORE_MAX } from "@/lib/score";
import type { Business } from "@/types";

interface PriorityOpportunitiesProps {
  businesses: Business[];
}

/** Melhores oportunidades encontradas recentemente. */
export function PriorityOpportunities({
  businesses,
}: PriorityOpportunitiesProps) {
  return (
    <ul className="divide-y divide-border">
      {businesses.map((business) => (
        <li
          key={business.id}
          className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <p className="truncate font-medium">{business.name}</p>
              <span className="text-xs text-muted-foreground">
                {getCategoryLabel(business.category)} · {business.city}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <RatingInline
                rating={business.rating}
                reviews={business.reviews}
              />
              <span className="text-sm text-muted-foreground">
                {business.problem}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <div className="flex items-center gap-3">
              <p className="font-heading font-medium tabular-nums">
                {business.score}
                <span className="text-xs text-muted-foreground">
                  /{SCORE_MAX}
                </span>
              </p>
              <ScoreBadge score={business.score} short className="hidden sm:inline-flex" />
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/empresas/${business.id}`}>
                Ver oportunidade
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
