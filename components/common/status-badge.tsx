import { getLeadStatusConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const STATUS_STYLES: Record<LeadStatus, { badge: string; dot: string }> = {
  novo: { badge: "bg-secondary text-secondary-foreground", dot: "bg-foreground/40" },
  contatado: { badge: "bg-brand-surface text-brand", dot: "bg-brand/60" },
  respondeu: { badge: "bg-brand-surface text-brand", dot: "bg-brand" },
  reuniao: {
    badge: "bg-score-good-surface text-score-good",
    dot: "bg-score-good",
  },
  proposta: {
    badge: "bg-score-medium-surface text-score-medium",
    dot: "bg-score-medium",
  },
  fechado: { badge: "bg-positive-surface text-positive", dot: "bg-positive" },
  perdido: { badge: "bg-muted text-muted-foreground", dot: "bg-negative/60" },
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getLeadStatusConfig(status);
  const styles = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        styles.badge,
        className
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} />
      {config.label}
    </span>
  );
}
