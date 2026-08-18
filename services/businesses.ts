import { sortBusinesses } from "@/lib/business-filters";
import type {
  Business,
  BusinessSort,
  SearchFilters,
  SearchResult,
} from "@/types";
import { API_ENDPOINTS } from "./api";

export { sortBusinesses };

export interface Enrichment {
  instagram: string | null;
  email: string | null;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new Error(`Requisição falhou: ${response.status}`);
  }

  return (await response.json()) as T;
}

/** POST /api/businesses/search */
export async function searchBusinesses(
  filters: SearchFilters,
  sort: BusinessSort = "oportunidade"
): Promise<SearchResult> {
  return request<SearchResult>(API_ENDPOINTS.searchBusinesses, {
    method: "POST",
    body: JSON.stringify({ filters, sort }),
  });
}

/** GET /api/businesses */
export async function getBusinesses(): Promise<Business[]> {
  return request<Business[]>(`${API_ENDPOINTS.businesses}?minScore=0`);
}

/** GET /api/businesses/:id */
export async function getBusiness(id: string): Promise<Business | null> {
  try {
    return await request<Business>(API_ENDPOINTS.business(id));
  } catch {
    return null;
  }
}

/**
 * POST /api/businesses/:id/enrich — procura Instagram e e-mail no site da
 * empresa. Retorna nulos quando ela não tem site.
 */
export async function enrichBusiness(id: string): Promise<Enrichment> {
  return request<Enrichment>(API_ENDPOINTS.enrichBusiness(id), {
    method: "POST",
  });
}
