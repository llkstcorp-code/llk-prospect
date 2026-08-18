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
import type { Lead, LeadStatus } from "@/types";

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
}

export function LeadsTable({ leads, onStatusChange }: LeadsTableProps) {
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
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="py-3 pl-5">
              <Link
                href={`/leads/${lead.id}`}
                className="font-medium hover:underline"
              >
                {lead.businessName}
              </Link>
              <p className="text-xs text-muted-foreground">
                {lead.city}, {lead.state}
              </p>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {getCategoryLabel(lead.category)}
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  "font-heading font-medium tabular-nums",
                  SCORE_TIER_STYLES[getScoreTier(lead.score).id].text
                )}
              >
                {lead.score}
              </span>
            </TableCell>
            <TableCell>{lead.serviceName}</TableCell>
            <TableCell className="tabular-nums">
              {formatCurrency(lead.estimatedValue)}
            </TableCell>
            <TableCell>
              <StatusBadge status={lead.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatRelativeDate(lead.lastContactAt)}
            </TableCell>
            <TableCell className="pr-5">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href={`/leads/${lead.id}`} aria-label="Abrir lead">
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
                        disabled={status.id === lead.status}
                        onSelect={() => onStatusChange(lead, status.id)}
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
