"use client";

import { Check, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ServiceOffering } from "@/types";

interface RecommendedServiceCardProps {
  service: ServiceOffering;
  reasons: string[];
  /** O lead já existe no CRM. */
  isInCrm: boolean;
  isPending: boolean;
  onAddToCrm: () => void;
  className?: string;
}

export function RecommendedServiceCard({
  service,
  reasons,
  isInCrm,
  isPending,
  onAddToCrm,
  className,
}: RecommendedServiceCardProps) {
  return (
    <Card className={cn("[--card-spacing:--spacing(5)]", className)}>
      <CardHeader>
        <CardTitle>Serviço recomendado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="font-heading text-lg font-medium">{service.name}</p>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            {service.description}
          </p>
        </div>

        <div className="rounded-lg bg-brand-surface px-4 py-3">
          <p className="text-xs text-muted-foreground">Preço estimado</p>
          <p className="mt-0.5 font-heading text-2xl font-medium text-brand">
            {formatPrice(service.price, service.priceModel)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Motivos
          </p>
          <ul className="mt-3 space-y-2">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2.5 text-sm">
                <Check
                  className="mt-0.5 size-3.5 shrink-0 text-positive"
                  strokeWidth={3}
                />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <Button
          className="w-full"
          onClick={onAddToCrm}
          disabled={isInCrm || isPending}
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : isInCrm ? (
            <Check data-icon="inline-start" />
          ) : (
            <Plus data-icon="inline-start" />
          )}
          {isInCrm ? "Já está no CRM" : "Adicionar ao CRM"}
        </Button>
      </CardContent>
    </Card>
  );
}
