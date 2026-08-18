import Link from "next/link";

import {
  PresenceIndicator,
  RatingInline,
} from "@/components/business/business-meta";
import { ScoreBadge } from "@/components/common/lead-score";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategoryLabel } from "@/data/categories";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { Business } from "@/types";

interface BusinessTableProps {
  businesses: Business[];
}

/** Tabela de resultados para desktop. No mobile use `BusinessCard`. */
export function BusinessTable({ businesses }: BusinessTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Empresa</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Avaliação</TableHead>
          <TableHead className="text-center">Site</TableHead>
          <TableHead className="text-center">Instagram</TableHead>
          <TableHead>Score</TableHead>
          <TableHead className="pr-5 text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {businesses.map((business) => (
          <TableRow key={business.id}>
            <TableCell className="py-3 pl-5">
              <p className="font-medium">{business.name}</p>
              <p className="text-xs text-muted-foreground">
                {business.city}, {business.state}
              </p>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {getCategoryLabel(business.category)}
            </TableCell>
            <TableCell>
              <RatingInline
                rating={business.rating}
                reviews={business.reviews}
              />
            </TableCell>
            <TableCell>
              <PresenceIndicator
                value={business.website}
                className="justify-center"
              />
            </TableCell>
            <TableCell>
              <PresenceIndicator
                value={business.instagram}
                className="justify-center"
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "font-heading font-medium tabular-nums",
                    SCORE_TIER_STYLES[getScoreTier(business.score).id].text
                  )}
                >
                  {business.score}
                </span>
                <ScoreBadge
                  score={business.score}
                  short
                  className="hidden 2xl:inline-flex"
                />
              </div>
            </TableCell>
            <TableCell className="pr-5 text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/empresas/${business.id}`}>Analisar</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
