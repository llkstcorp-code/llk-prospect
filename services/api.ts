/**
 * Ponto único de contato com o "backend".
 *
 * Hoje as funções de `/services` resolvem com dados mockados. Quando o backend
 * existir, cada serviço passa a chamar o endpoint correspondente abaixo — as
 * assinaturas usadas pelas telas continuam iguais.
 */
export const API_ENDPOINTS = {
  businesses: "/api/businesses",
  searchBusinesses: "/api/businesses/search",
  business: (id: string) => `/api/businesses/${id}`,
  analyzeBusiness: (id: string) => `/api/businesses/${id}/analyze`,
  enrichBusiness: (id: string) => `/api/businesses/${id}/enrich`,
  leads: "/api/leads",
  lead: (id: string) => `/api/leads/${id}`,
  services: "/api/services",
  service: (id: string) => `/api/services/${id}`,
  dashboard: "/api/dashboard",
} as const;

/** Latência simulada para que os estados de carregamento sejam reais. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Cópia profunda simples para que os mocks nunca sejam mutados por engano. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}
