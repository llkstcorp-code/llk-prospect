/** Ponto único de contato com as rotas de API do próprio app. */
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
  profile: "/api/perfil",
  contacts: "/api/contatos",
  contactsOf: (businessId: string) =>
    `/api/contatos?empresa=${encodeURIComponent(businessId)}`,
  contact: (id: string) => `/api/contatos/${id}`,
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
