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

/** `manual` é a empresa digitada por uma pessoa, sem fonte pública por trás. */
export type BusinessDataSource = "google" | "geoapify" | "mock" | "manual";

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
  dataSource?: BusinessDataSource;
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
  status: DealStatus | null;
  /** ISO date — usado na ordenação por "mais recentes". */
  foundAt: string;
  /** Verdadeiro depois que a empresa fecha o primeiro negócio. */
  isClient?: boolean;
}

/** Pessoa de contato dentro de uma empresa. */
export interface Contact {
  id: string;
  businessId: string;
  name: string;
  /** Cargo ou papel: "dono", "gerente", "responsável pelo marketing". */
  role: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  /** O contato que a abordagem usa por padrão. Um por empresa. */
  isPrimary: boolean;
  notes: string;
  /** ISO date. */
  createdAt: string;
}

export type ContactInput = Omit<Contact, "id" | "createdAt">;

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

export type DealStatus =
  | "novo"
  | "contatado"
  | "respondeu"
  | "reuniao"
  | "proposta"
  | "fechado"
  | "perdido";

export interface DealStatusConfig {
  id: DealStatus;
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

export interface DealNote {
  id: string;
  content: string;
  /** ISO date. */
  createdAt: string;
}

export interface Deal {
  id: string;
  businessId: string;
  businessName: string;
  /** Como a equipe chama este negócio — distingue dois da mesma empresa. */
  title: string;
  category: CategoryId;
  city: string;
  state: string;
  score: number;
  problem: string;
  serviceId: string;
  serviceName: string;
  estimatedValue: number;
  status: DealStatus;
  /** ISO date. */
  createdAt: string;
  /** ISO date ou null quando ainda não houve contato. */
  lastContactAt: string | null;
  /** ISO date do fechamento ou da perda; null enquanto o negócio está aberto. */
  closedAt: string | null;
  lostReason: string | null;
  /** Contato desta negociação. Pode diferir do principal da empresa. */
  contactId: string | null;
  contactName: string | null;
  timeline: TimelineEvent[];
  notes: DealNote[];
}

export type TaskKind =
  | "followup"
  | "ligacao"
  | "reuniao"
  | "proposta"
  | "outro";

/** Próxima ação do funil. O que já aconteceu fica em `TimelineEvent`. */
export interface Task {
  id: string;
  /** Responsável. Todos veem todas; alguém executa cada uma. */
  ownerId: string;
  ownerName: string;
  dealId: string | null;
  dealTitle: string | null;
  businessId: string | null;
  businessName: string | null;
  title: string;
  kind: TaskKind;
  /** ISO date-time do vencimento. */
  dueAt: string;
  /** ISO date-time da conclusão; null enquanto está aberta. */
  doneAt: string | null;
  /** Criada pelo sistema ao mover um negócio de etapa. */
  isAutomatic: boolean;
  createdAt: string;
}

export interface TaskInput {
  title: string;
  kind: TaskKind;
  dueAt: string;
  dealId?: string | null;
  businessId?: string | null;
  contactId?: string | null;
  ownerId?: string | null;
}

export interface TaskKindConfig {
  id: TaskKind;
  label: string;
}

/** O que a interface envia para abrir um negócio. */
export interface DealInput {
  businessId: string;
  title: string;
  serviceId: string;
  contactId: string | null;
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

/** O que uma pessoa digita ao cadastrar uma empresa na mão. */
export interface ManualBusinessInput {
  name: string;
  category: CategoryId;
  city: string;
  state: string;
  phone: string;
  address: string;
  /** URL quando informada; string vazia quando a pessoa só marcou que existe. */
  website: string;
  instagram: string;
  hasWebsite: boolean;
  hasInstagram: boolean;
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
