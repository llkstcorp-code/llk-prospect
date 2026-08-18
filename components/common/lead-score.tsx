import { Flame, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { getScoreTier, SCORE_MAX, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { ScoreTierId } from "@/types";

const TIER_ICON: Record<ScoreTierId, React.ElementType> = {
  baixa: TrendingDown,
  moderada: Minus,
  boa: TrendingUp,
  excelente: Flame,
};

const SIZE_STYLES = {
  sm: { value: "text-sm", max: "text-[0.7rem]" },
  md: { value: "text-xl", max: "text-xs" },
  lg: { value: "text-4xl", max: "text-sm" },
} as const;

interface ScoreBadgeProps {
  score: number;
  /** Usa o rótulo curto ("Excelente") em vez do completo. */
  short?: boolean;
  className?: string;
}

/** Selo com a faixa de oportunidade do score. */
export function ScoreBadge({ score, short, className }: ScoreBadgeProps) {
  const tier = getScoreTier(score);
  const styles = SCORE_TIER_STYLES[tier.id];
  const Icon = TIER_ICON[tier.id];

  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        styles.surface,
        styles.text,
        className
      )}
    >
      <Icon className="size-3.5" />
      {short ? tier.shortLabel : tier.label}
    </span>
  );
}

interface LeadScoreProps {
  score: number;
  size?: keyof typeof SIZE_STYLES;
  /** Exibe "/100" ao lado do número. */
  showMax?: boolean;
  /** Exibe o selo com a faixa de oportunidade. */
  showLabel?: boolean;
  className?: string;
}

/**
 * Representação visual do score de oportunidade de uma empresa.
 * 0–39 baixa · 40–69 moderada · 70–84 boa · 85–100 excelente.
 */
export function LeadScore({
  score,
  size = "md",
  showMax = false,
  showLabel = false,
  className,
}: LeadScoreProps) {
  const tier = getScoreTier(score);
  const styles = SCORE_TIER_STYLES[tier.id];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <p className={cn("font-heading font-medium tabular-nums", styles.text)}>
        <span className={sizeStyles.value}>{score}</span>
        {showMax ? (
          <span className={cn("text-muted-foreground", sizeStyles.max)}>
            /{SCORE_MAX}
          </span>
        ) : null}
      </p>
      {showLabel ? <ScoreBadge score={score} /> : null}
    </div>
  );
}

interface ScoreBarProps {
  score: number;
  className?: string;
}

/** Barra fina usada em cards e listas para comparar scores rapidamente. */
export function ScoreBar({ score, className }: ScoreBarProps) {
  const tier = getScoreTier(score);

  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
      role="presentation"
    >
      <div
        className={cn("h-full rounded-full", SCORE_TIER_STYLES[tier.id].bar)}
        style={{ width: `${Math.min(Math.max(score, 0), SCORE_MAX)}%` }}
      />
    </div>
  );
}
