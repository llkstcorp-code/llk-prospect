import type {
  BusinessSort,
  LeadStatus,
  LeadStatusConfig,
  PriceModel,
  SearchFilters,
  ServiceType,
} from "@/types";

export const APP_NAME = "LLK Prospect";
export const APP_TAGLINE =
  "Encontre empresas. Encontre oportunidades. Venda mais.";

export const RADIUS_OPTIONS = [5, 10, 20, 50] as const;

export const SORT_OPTIONS: { value: BusinessSort; label: string }[] = [
  { value: "oportunidade", label: "Maior oportunidade" },
  { value: "avaliacoes", label: "Mais avaliações" },
  { value: "melhor-avaliacao", label: "Melhor avaliação" },
  { value: "recentes", label: "Mais recentes" },
];

/** Ordem das colunas do CRM e das etapas do funil de vendas. */
export const LEAD_STATUSES: LeadStatusConfig[] = [
  {
    id: "novo",
    label: "Novo",
    description: "Lead adicionado, ainda sem contato.",
  },
  {
    id: "contatado",
    label: "Contatado",
    description: "Primeira abordagem enviada.",
  },
  {
    id: "respondeu",
    label: "Respondeu",
    description: "O cliente respondeu à abordagem.",
  },
  {
    id: "reuniao",
    label: "Reunião",
    description: "Reunião agendada ou realizada.",
  },
  {
    id: "proposta",
    label: "Proposta",
    description: "Proposta comercial enviada.",
  },
  { id: "fechado", label: "Fechado", description: "Negócio ganho." },
  { id: "perdido", label: "Perdido", description: "Negócio encerrado sem venda." },
];

export const LEAD_STATUS_ORDER: LeadStatus[] = LEAD_STATUSES.map(
  (status) => status.id
);

export function getLeadStatusConfig(status: LeadStatus): LeadStatusConfig {
  return (
    LEAD_STATUSES.find((item) => item.id === status) ?? LEAD_STATUSES[0]
  );
}

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: "site", label: "Site" },
  { value: "landing", label: "Landing page" },
  { value: "seo", label: "SEO" },
  { value: "sistema", label: "Sistema" },
  { value: "manutencao", label: "Manutenção" },
];

export const PRICE_MODELS: { value: PriceModel; label: string }[] = [
  { value: "unico", label: "Valor único" },
  { value: "mensal", label: "Mensal" },
];

export function getServiceTypeLabel(type: ServiceType): string {
  return SERVICE_TYPES.find((item) => item.value === type)?.label ?? "Serviço";
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  city: "Passos",
  state: "MG",
  radiusKm: 20,
  category: "todas",
  minRating: 4,
  minReviews: 50,
  hasWebsite: "nao",
  hasInstagram: "qualquer",
  minScore: 60,
};

/** Etapas exibidas durante a busca simulada de empresas. */
export const SEARCH_STEPS = [
  "Buscando empresas...",
  "Consultando estabelecimentos...",
  "Analisando oportunidades...",
  "Organizando resultados...",
] as const;

export const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;
