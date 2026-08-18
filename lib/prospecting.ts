import { MOCK_SERVICES } from "@/data/mockServices";
import { SCORE_MAX, SCORE_MIN } from "@/lib/score";
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
  /** A Geoapify tinha ficha de detalhes: a ausência de site foi conferida. */
  websiteChecked: boolean;
  hasPhone: boolean;
  hasStreetAddress: boolean;
  hasAddress: boolean;
  /** Rede ou franquia (tag brand/operator no OpenStreetMap). */
  isChain: boolean;
  hasName: boolean;
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

const KNOWN_DIGITAL_NEED = new Set<CategoryId>([
  "loja",
  "oficina",
  "construcao",
  "prestador",
]);

/**
 * Rede não contrata site de agência local: a decisão é da matriz e a
 * presença digital já existe. Penaliza sem zerar, porque a filial ainda pode
 * virar cliente de serviços menores.
 */
const CHAIN_PENALTY = 25;

/**
 * Quanto temos para vender. Sem ficha de detalhes na Geoapify não dá para
 * afirmar que a empresa não tem site — só que a fonte não sabe. Esse caso
 * fica no meio, entre o site confirmado e a ausência confirmada.
 */
function getDigitalGapPoints(input: GeoapifyScoreInput): number {
  if (input.hasWebsite) return 8;
  return input.websiteChecked ? 40 : 26;
}

/** Quão perto estamos de conseguir falar com essa empresa. */
function getContactPoints(input: GeoapifyScoreInput): number {
  if (input.hasPhone) return 20;
  if (input.hasStreetAddress) return 12;
  if (input.hasAddress) return 6;
  return 0;
}

function getCategoryNeedPoints(category: CategoryId): number {
  if (HIGH_DIGITAL_NEED.has(category)) return 22;
  return KNOWN_DIGITAL_NEED.has(category) ? 14 : 8;
}

/** Cadastro sem nome não dá para abordar: some da frente da fila. */
function getIdentityPoints(input: GeoapifyScoreInput): number {
  return input.hasName ? 18 : 0;
}

/** Score preliminar para fontes que não oferecem nota nem avaliações. */
export function computeGeoapifyScore(input: GeoapifyScoreInput): number {
  const total =
    getDigitalGapPoints(input) +
    getContactPoints(input) +
    getCategoryNeedPoints(input.category) +
    getIdentityPoints(input) -
    (input.isChain ? CHAIN_PENALTY : 0);

  return Math.max(SCORE_MIN, Math.min(total, SCORE_MAX));
}

export function deriveGeoapifyProblem(input: GeoapifyScoreInput): string {
  if (input.isChain) return "Rede com presença digital própria";
  if (!input.hasName) return "Cadastro sem nome na fonte";
  if (input.hasWebsite) return "Presença digital pode ser otimizada";
  if (input.websiteChecked) return "Não possui site";
  return "Site não identificado nas fontes públicas";
}

export function recommendGeoapifyServiceId(
  input: GeoapifyScoreInput
): string {
  if (!input.hasWebsite) return "site-profissional";
  return computeGeoapifyScore(input) >= 60 ? "seo" : "manutencao";
}
