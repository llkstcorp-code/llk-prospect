/**
 * Tipos de domínio do LLK Prospect.
 *
 * Estes tipos representam o contrato esperado da API. Enquanto o backend não
 * existe, a camada de serviços (`/services`) devolve dados mockados com estas
 * mesmas formas — quando as APIs reais entrarem, nada aqui precisa mudar.
 */

export type CategoryId =
  | "restaurante"
  | "pizzaria"
  | "pousada"
  | "hotel"
  | "academia"
  | "clinica"
  | "dentista"
  | "imobiliaria"
  | "loja"
  | "oficina"
  | "construcao"
  | "prestador"
  | "outros";

export interface Category {
  id: CategoryId;
  label: string;
  /** Rótulo no singular usado em cards e tabelas. */
  singular: string;
}

export type ServiceType = "site" | "seo" | "landing" | "sistema" | "manutencao";

export type PriceModel = "unico" | "mensal";

export interface ServiceOffering {
  id: string;
  name: string;
  description: string;
  price: number;
  priceModel: PriceModel;
  type: ServiceType;
  /** Score a partir do qual este serviço passa a ser recomendado. */
  minScore: number;
}

export interface Business {
  id: string;
  name: string;
  category: CategoryId;
  city: string;
  state: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  /** Falso quando a fonte não oferece avaliações públicas. */
  ratingAvailable?: boolean;
  /** Origem usada para obter os dados comerciais. */
  dataSource?: "google" | "geoapify" | "mock";
  website: string | null;
  instagram: string | null;
  /** Preenchido apenas pelo enriquecimento sob demanda. */
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  score: number;
  /** Lacuna digital identificada, ex.: "Não possui site". */
  problem: string;
  recommendedServiceId: string;
  estimatedValue: number;
  status: LeadStatus | null;
  /** ISO date — usado na ordenação por "mais recentes". */
  foundAt: string;
}

export type ScoreTierId = "baixa" | "moderada" | "boa" | "excelente";

export interface ScoreTier {
  id: ScoreTierId;
  /** Rótulo completo, ex.: "Excelente oportunidade". */
  label: string;
  /** Rótulo curto usado em badges compactos, ex.: "Excelente". */
  shortLabel: string;
  min: number;
  max: number;
}

export type LeadStatus =
  | "novo"
  | "contatado"
  | "respondeu"
  | "reuniao"
  | "proposta"
  | "fechado"
  | "perdido";

export interface LeadStatusConfig {
  id: LeadStatus;
  label: string;
  description: string;
}

export type TimelineEventType =
  | "created"
  | "analysis"
  | "contact"
  | "reply"
  | "meeting"
  | "proposal"
  | "won"
  | "lost"
  | "note";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  /** ISO date. */
  date: string;
}

export interface LeadNote {
  id: string;
  content: string;
  /** ISO date. */
  createdAt: string;
}

export interface Lead {
  id: string;
  businessId: string;
  businessName: string;
  category: CategoryId;
  city: string;
  state: string;
  score: number;
  problem: string;
  serviceId: string;
  serviceName: string;
  estimatedValue: number;
  status: LeadStatus;
  /** ISO date. */
  createdAt: string;
  /** ISO date ou null quando ainda não houve contato. */
  lastContactAt: string | null;
  timeline: TimelineEvent[];
  notes: LeadNote[];
}

export type IndicatorLevel = "alto" | "medio" | "baixo";

export interface AnalysisIndicator {
  label: string;
  value: string;
  level: IndicatorLevel;
}

export interface BusinessAnalysis {
  businessId: string;
  summary: string;
  indicators: AnalysisIndicator[];
  service: ServiceOffering;
  reasons: string[];
  estimatedValue: number;
  pitch: string;
}

export type PresenceFilter = "qualquer" | "sim" | "nao";

export interface SearchFilters {
  city: string;
  state: string;
  radiusKm: number;
  category: CategoryId | "todas";
  minRating: number;
  minReviews: number;
  hasWebsite: PresenceFilter;
  hasInstagram: PresenceFilter;
  minScore: number;
}

export type BusinessSort =
  | "oportunidade"
  | "avaliacoes"
  | "melhor-avaliacao"
  | "recentes";

export interface SearchResult {
  businesses: Business[];
  total: number;
  provider?: "google" | "geoapify" | "mock";
}

export type TrendDirection = "up" | "down" | "neutral";

export interface ChartPoint {
  /** ISO date. */
  date: string;
  value: number;
}

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  role: string;
  initials: string;
}

export interface ProspectingPreferences {
  defaultCity: string;
  defaultState: string;
  defaultRadiusKm: number;
  favoriteCategories: CategoryId[];
  minScore: number;
}

export interface Settings {
  profile: UserProfile;
  prospecting: ProspectingPreferences;
  services: ServiceOffering[];
}
