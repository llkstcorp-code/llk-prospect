"use client";

import { AtSign, Globe, Loader2, Mail, MapPin, Phone, Search, Star } from "lucide-react";

import { PresenceIndicator } from "@/components/business/business-meta";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber, formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Business } from "@/types";

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  className?: string;
}

function InfoRow({ icon: Icon, label, children, className }: InfoRowProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm">{children}</div>
      </div>
    </div>
  );
}

interface BusinessInfoCardProps {
  business: Business;
  isEnriching: boolean;
  hasEnriched: boolean;
  onEnrich: () => void;
  className?: string;
}

export function BusinessInfoCard({
  business,
  isEnriching,
  hasEnriched,
  onEnrich,
  className,
}: BusinessInfoCardProps) {
  return (
    <Card className={cn("[--card-spacing:--spacing(5)]", className)}>
      <CardHeader>
        <CardTitle>Informações da empresa</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={onEnrich}
            disabled={isEnriching || hasEnriched}
          >
            {isEnriching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search data-icon="inline-start" />
            )}
            {hasEnriched ? "Contatos verificados" : "Buscar contatos"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <InfoRow icon={Star} label="Avaliação">
          {business.ratingAvailable === false ? (
            <span className="text-muted-foreground">Indisponível nesta fonte</span>
          ) : (
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium tabular-nums">
                {formatRating(business.rating)}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {formatNumber(business.reviews)} avaliações
              </span>
            </span>
          )}
        </InfoRow>

        <InfoRow icon={Globe} label="Website">
          <PresenceIndicator value={business.website} showValue />
        </InfoRow>

        <InfoRow icon={AtSign} label="Instagram">
          <PresenceIndicator value={business.instagram} showValue />
        </InfoRow>

        <InfoRow icon={Phone} label="Telefone">
          {business.phone}
        </InfoRow>

        {business.email ? (
          <InfoRow icon={Mail} label="E-mail">
            {business.email}
          </InfoRow>
        ) : null}

        <InfoRow icon={MapPin} label="Endereço" className="sm:col-span-2">
          {business.address}
          {business.city ? ` — ${business.city}, ${business.state}` : null}
        </InfoRow>

        {business.dataSource === "geoapify" ? (
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Dados de localização fornecidos por Geoapify.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
