"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, ExternalLink } from "lucide-react";

import {
  PresenceIndicator,
  RatingInline,
} from "@/components/business/business-meta";
import { EmptyState } from "@/components/common/empty-state";
import { DetailSkeleton } from "@/components/common/loading-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Timeline } from "@/components/common/timeline";
import { useToast } from "@/components/common/toast";
import { LeadNotes } from "@/components/leads/lead-notes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategoryLabel } from "@/data/categories";
import { getLeadStatusConfig, LEAD_STATUSES } from "@/lib/constants";
import {
  formatCurrency,
  formatLongDate,
  formatRelativeDate,
} from "@/lib/format";
import { getScoreTier, SCORE_MAX, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
import { getBusiness } from "@/services/businesses";
import { useLeads } from "@/store/leads-store";
import type { Business, LeadStatus } from "@/types";

interface LeadDetailProps {
  leadId: string;
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export function LeadDetail({ leadId }: LeadDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { leads, isLoading, changeStatus, addNote } = useLeads();
  const [business, setBusiness] = React.useState<Business | null>(null);

  const lead = leads.find((item) => item.id === leadId);
  const businessId = lead?.businessId;

  React.useEffect(() => {
    if (!businessId) return;
    let active = true;
    void getBusiness(businessId).then((result) => {
      if (active) setBusiness(result);
    });
    return () => {
      active = false;
    };
  }, [businessId]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!lead) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="Lead não encontrado"
          description="Esse lead não está mais na sua carteira."
          action={
            <Button variant="outline" asChild>
              <Link href="/leads">Voltar para os leads</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  async function handleStatusChange(status: LeadStatus) {
    if (!lead) return;
    try {
      await changeStatus(lead.id, status);
      toast({
        title: "Etapa atualizada",
        description: `${lead.businessName} foi movido para ${getLeadStatusConfig(status).label}.`,
        variant: "success",
      });
    } catch {
      toast({ title: "Não foi possível atualizar a etapa", variant: "error" });
    }
  }

  async function handleAddNote(content: string) {
    if (!lead) return;
    try {
      await addNote(lead.id, content);
      toast({ title: "Observação adicionada", variant: "success" });
    } catch {
      toast({
        title: "Não foi possível salvar a observação",
        variant: "error",
      });
    }
  }

  const tier = getScoreTier(lead.score);

  return (
    <div className="space-y-6">
      <Card className="[--card-spacing:--spacing(6)]">
        <div className="flex flex-col gap-5 px-(--card-spacing) lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl font-medium tracking-tight text-balance">
                {lead.businessName}
              </h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {getCategoryLabel(lead.category)} · {lead.city}, {lead.state} ·
              Lead criado em {formatLongDate(lead.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/empresas/${lead.businessId}`}>
                <ExternalLink data-icon="inline-start" />
                Ver empresa
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft data-icon="inline-start" />
              Voltar
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem]">
        <div className="space-y-6">
          <Card className="[--card-spacing:--spacing(5)]">
            <CardHeader>
              <CardTitle>Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              {business ? (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Google</dt>
                    <dd className="mt-1">
                      <RatingInline
                        rating={business.rating}
                        reviews={business.reviews}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Telefone</dt>
                    <dd className="mt-1 text-sm">{business.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Website</dt>
                    <dd className="mt-1">
                      <PresenceIndicator value={business.website} showValue />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Instagram</dt>
                    <dd className="mt-1">
                      <PresenceIndicator value={business.instagram} showValue />
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Endereço</dt>
                    <dd className="mt-1 text-sm">
                      {business.address} — {business.city}, {business.state}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Carregando dados da empresa...
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="[--card-spacing:--spacing(5)]">
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={lead.timeline} />
            </CardContent>
          </Card>

          <LeadNotes notes={lead.notes} onAdd={handleAddNote} />
        </div>

        <Card className="[--card-spacing:--spacing(5)] lg:sticky lg:top-10">
          <CardHeader>
            <CardTitle>Resumo do negócio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">Valor potencial</p>
              <p className="mt-0.5 font-heading text-2xl font-medium">
                {formatCurrency(lead.estimatedValue)}
              </p>
            </div>

            <dl className="space-y-3">
              <SummaryRow label="Serviço">{lead.serviceName}</SummaryRow>
              <SummaryRow label="Score">
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    SCORE_TIER_STYLES[tier.id].text
                  )}
                >
                  {lead.score}
                  <span className="text-muted-foreground">/{SCORE_MAX}</span>
                </span>
              </SummaryRow>
              <SummaryRow label="Problema">{lead.problem}</SummaryRow>
              <SummaryRow label="Último contato">
                {formatRelativeDate(lead.lastContactAt)}
              </SummaryRow>
            </dl>

            <div className="space-y-1.5 border-t border-border pt-4">
              <label
                htmlFor="lead-status"
                className="text-xs text-muted-foreground"
              >
                Status
              </label>
              <Select
                value={lead.status}
                onValueChange={(value) =>
                  void handleStatusChange(value as LeadStatus)
                }
              >
                <SelectTrigger id="lead-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
