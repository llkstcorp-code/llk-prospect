import { Check, Star, X } from "lucide-react";

import { formatNumber, formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RatingInlineProps {
  rating: number;
  reviews: number;
  /** Exibe apenas a nota, sem a contagem de avaliações. */
  compact?: boolean;
  className?: string;
}

export function RatingInline({
  rating,
  reviews,
  compact = false,
  className,
}: RatingInlineProps) {
  const isAvailable = rating > 0 || reviews > 0;

  if (!isAvailable) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        Avaliação indisponível
      </span>
    );
  }

  return (
    <span
      className={cn("flex items-center gap-1.5 text-sm whitespace-nowrap", className)}
    >
      <Star className="size-3.5 shrink-0 fill-score-medium text-score-medium" />
      <span className="font-medium tabular-nums">{formatRating(rating)}</span>
      {!compact ? (
        <span className="text-muted-foreground tabular-nums">
          {formatNumber(reviews)} avaliações
        </span>
      ) : null}
    </span>
  );
}

interface PresenceIndicatorProps {
  /** Valor encontrado (url, @perfil) ou null quando não existe. */
  value: string | null;
  /** Mostra o valor ao lado do ícone. */
  showValue?: boolean;
  className?: string;
}

/** Marca visual de presença digital: encontrado x não encontrado. */
export function PresenceIndicator({
  value,
  showValue = false,
  className,
}: PresenceIndicatorProps) {
  const Icon = value ? Check : X;

  return (
    <span className={cn("flex items-center gap-1.5 text-sm", className)}>
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full",
          value
            ? "bg-positive-surface text-positive"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-2.5" strokeWidth={3} />
      </span>
      {showValue ? (
        <span
          className={cn(
            "truncate",
            value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {value ?? "Não encontrado"}
        </span>
      ) : null}
    </span>
  );
}
