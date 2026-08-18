import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TrendDirection } from "@/types";

const TREND_STYLES: Record<TrendDirection, string> = {
  up: "text-positive",
  down: "text-negative",
  neutral: "text-muted-foreground",
};

interface StatCardProps {
  label: string;
  value: number;
  trendLabel: string;
  trend: TrendDirection;
  icon: React.ElementType;
  valueSuffix?: string;
}

export function StatCard({
  label,
  value,
  trendLabel,
  trend,
  icon: Icon,
  valueSuffix = "",
}: StatCardProps) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 shrink-0 text-muted-foreground/70" />
      </div>
      <p className="mt-3 font-heading text-3xl font-medium tracking-tight tabular-nums">
        {formatNumber(value)}{valueSuffix}
      </p>
      {trendLabel ? <p
        className={cn(
          "mt-2 flex items-center gap-1 text-xs font-medium",
          TREND_STYLES[trend]
        )}
      >
        {trend !== "neutral" ? <TrendIcon className="size-3.5" /> : null}
        {trendLabel}
      </p> : null}
    </div>
  );
}
