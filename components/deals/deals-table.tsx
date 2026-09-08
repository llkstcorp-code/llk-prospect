"use client";

import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategoryLabel } from "@/data/categories";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { Deal, DealStatus } from "@/types";

interface DealsTableProps {
  deals: Deal[];
  onStatusChange: (deal: Deal, status: DealStatus) => void;
}

export function DealsTable({ deals, onStatusChange }: DealsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Empresa</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Serviço</TableHead>
          <TableHead>Valor potencial</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Último contato</TableHead>
          <TableHead className="pr-5 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => (
          <TableRow key={deal.id}>
            <TableCell className="py-3 pl-5">
              <Link
                href={`/negocios/${deal.id}`}
                className="font-medium hover:underline"
              >
                {deal.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {deal.businessName} · {deal.city}, {deal.state}
              </p>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {getCategoryLabel(deal.category)}
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  "font-heading font-medium tabular-nums",
                  SCORE_TIER_STYLES[getScoreTier(deal.score).id].text
                )}
              >
                {deal.score}
              </span>
            </TableCell>
            <TableCell>{deal.serviceName}</TableCell>
            <TableCell className="tabular-nums">
              {formatCurrency(deal.estimatedValue)}
            </TableCell>
            <TableCell>
              <StatusBadge status={deal.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatRelativeDate(deal.lastContactAt)}
            </TableCell>
            <TableCell className="pr-5">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href={`/negocios/${deal.id}`} aria-label="Abrir negócio">
                    <ChevronRight />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Alterar etapa"
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {LEAD_STATUSES.map((status) => (
                      <DropdownMenuItem
                        key={status.id}
                        disabled={status.id === deal.status}
                        onSelect={() => onStatusChange(deal, status.id)}
                      >
                        {status.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
