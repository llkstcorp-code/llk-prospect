import { MOCK_SERVICES } from "@/data/mockServices";
import { SCORE_MAX } from "@/lib/score";
import type { CategoryId } from "@/types";

/**
 * Regras de qualificação de uma empresa.
 *
 * Os dados vindos do Google não trazem score: ele é calculado aqui a partir de
 * três sinais — reputação (a empresa funciona), lacuna digital (o que temos
 * para vender) e demanda (o tamanho da operação).
 */

const REPUTATION_MAX = 35;
const GAP_MAX = 45;
const DEMAND_MAX = 20;

/** Abaixo disso a nota não tem prova social suficiente para ser confiável. */
const MIN_RELIABLE_REVIEWS = 5;

export interface ScoreInput {
  rating: number;
  reviews: number;
  hasWebsite: boolean;
}

function getReputationPoints({ rating, reviews }: ScoreInput): number {
  if (reviews < MIN_RELIABLE_REVIEWS) return 6;
  if (rating >= 4.7) return REPUTATION_MAX;
  if (rating >= 4.5) return 31;
  if (rating >= 4.2) return 25;
  if (rating >= 3.8) return 17;
  return 9;
}

/** Sem site é a maior lacuna possível — é onde a LLK entrega mais valor. */
function getGapPoints({ hasWebsite }: ScoreInput): number {
  return hasWebsite ? 14 : GAP_MAX;
}

function getDemandPoints({ reviews }: ScoreInput): number {
  if (reviews >= 300) return DEMAND_MAX;
  if (reviews >= 150) return 17;
  if (reviews >= 80) return 13;
  if (reviews >= 30) return 9;
  if (reviews >= 10) return 5;
  return 2;
}

/** Score de oportunidade de 0 a 100. */
export function computeScore(input: ScoreInput): number {
  const total =
    getReputationPoints(input) + getGapPoints(input) + getDemandPoints(input);

  return Math.min(Math.round(total), SCORE_MAX);
}

/** Lacuna digital identificada, exibida em toda a interface. */
export function deriveProblem(input: ScoreInput): string {
  if (!input.hasWebsite) return "Não possui site";
  if (input.reviews >= 80 && input.rating >= 4.3) {
    return "Site sem visibilidade nas buscas locais";
  }
  return "Site precisa de manutenção e atualização";
}

export function recommendServiceId(input: ScoreInput): string {
  if (!input.hasWebsite) return "site-profissional";
  return computeScore(input) >= 60 ? "seo" : "manutencao";
}

export function estimateValue(serviceId: string): number {
  return MOCK_SERVICES.find((service) => service.id === serviceId)?.price ?? 0;
}

export interface GeoapifyScoreInput {
  hasWebsite: boolean;
  hasPhone: boolean;
  hasAddress: boolean;
  category: CategoryId;
}

const HIGH_DIGITAL_NEED = new Set<CategoryId>([
  "restaurante",
  "pizzaria",
  "pousada",
  "hotel",
  "academia",
  "clinica",
  "dentista",
  "imobiliaria",
]);

/** Score preliminar para fontes que não oferecem nota nem avaliações. */
export function computeGeoapifyScore(input: GeoapifyScoreInput): number {
  const digitalGap = input.hasWebsite ? 16 : 45;
  const contactability = input.hasPhone ? 20 : 7;
  const localNeed = HIGH_DIGITAL_NEED.has(input.category) ? 22 : 14;
  const completeness = input.hasAddress ? 10 : 4;

  return Math.min(digitalGap + contactability + localNeed + completeness, SCORE_MAX);
}

export function deriveGeoapifyProblem(input: GeoapifyScoreInput): string {
  if (!input.hasWebsite) return "Não possui site cadastrado";
  if (!input.hasPhone) return "Presença digital com contato incompleto";
  return "Presença digital pode ser otimizada";
}

export function recommendGeoapifyServiceId(
  input: GeoapifyScoreInput
): string {
  if (!input.hasWebsite) return "site-profissional";
  return computeGeoapifyScore(input) >= 60 ? "seo" : "manutencao";
}
