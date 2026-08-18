import type { ScoreTier, ScoreTierId } from "@/types";

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

/** Score a partir do qual uma empresa entra na página de Oportunidades. */
export const OPPORTUNITY_MIN_SCORE = 70;

export const SCORE_TIERS: ScoreTier[] = [
  {
    id: "baixa",
    label: "Baixa oportunidade",
    shortLabel: "Baixa",
    min: 0,
    max: 39,
  },
  {
    id: "moderada",
    label: "Oportunidade moderada",
    shortLabel: "Moderada",
    min: 40,
    max: 69,
  },
  {
    id: "boa",
    label: "Boa oportunidade",
    shortLabel: "Boa",
    min: 70,
    max: 84,
  },
  {
    id: "excelente",
    label: "Excelente oportunidade",
    shortLabel: "Excelente",
    min: 85,
    max: 100,
  },
];

export function getScoreTier(score: number): ScoreTier {
  return (
    SCORE_TIERS.find((tier) => score >= tier.min && score <= tier.max) ??
    SCORE_TIERS[0]
  );
}

interface ScoreTierStyle {
  /** Cor do texto e dos números. */
  text: string;
  /** Fundo discreto usado em badges e destaques. */
  surface: string;
  /** Cor sólida usada em barras de progresso e indicadores. */
  bar: string;
  /** Borda usada em cards de oportunidade. */
  border: string;
}

export const SCORE_TIER_STYLES: Record<ScoreTierId, ScoreTierStyle> = {
  baixa: {
    text: "text-score-low",
    surface: "bg-score-low-surface",
    bar: "bg-score-low",
    border: "border-score-low/20",
  },
  moderada: {
    text: "text-score-medium",
    surface: "bg-score-medium-surface",
    bar: "bg-score-medium",
    border: "border-score-medium/25",
  },
  boa: {
    text: "text-score-good",
    surface: "bg-score-good-surface",
    bar: "bg-score-good",
    border: "border-score-good/25",
  },
  excelente: {
    text: "text-score-high",
    surface: "bg-score-high-surface",
    bar: "bg-score-high",
    border: "border-score-high/30",
  },
};
