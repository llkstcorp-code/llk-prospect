import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Business,
  CategoryId,
  SearchFilters,
} from "@/types";

interface BusinessRow {
  id: string;
  data_source: "google" | "geoapify" | "mock";
  name: string;
  category: CategoryId;
  city: string;
  state: string;
  address: string;
  phone: string;
  rating: number | string;
  reviews: number;
  rating_available: boolean;
  website: string | null;
  instagram: string | null;
  email: string | null;
  score: number;
  problem: string;
  recommended_service_id: string | null;
  estimated_value: number | string;
  latitude: number | null;
  longitude: number | null;
  found_at: string;
}

function toBusinessRow(business: Business): BusinessRow {
  return {
    id: business.id,
    data_source: business.dataSource ?? "geoapify",
    name: business.name,
    category: business.category,
    city: business.city,
    state: business.state,
    address: business.address,
    phone: business.phone,
    rating: business.rating,
    reviews: business.reviews,
    rating_available: business.ratingAvailable ?? false,
    website: business.website,
    instagram: business.instagram,
    email: business.email ?? null,
    score: business.score,
    problem: business.problem,
    recommended_service_id: business.recommendedServiceId,
    estimated_value: business.estimatedValue,
    latitude: business.latitude ?? null,
    longitude: business.longitude ?? null,
    found_at: business.foundAt,
  };
}

function fromBusinessRow(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    city: row.city,
    state: row.state,
    address: row.address,
    phone: row.phone,
    rating: Number(row.rating),
    reviews: row.reviews,
    ratingAvailable: row.rating_available,
    dataSource: row.data_source,
    website: row.website,
    instagram: row.instagram,
    email: row.email,
    score: row.score,
    problem: row.problem,
    recommendedServiceId:
      row.recommended_service_id ?? "site-profissional",
    estimatedValue: Number(row.estimated_value),
    latitude: row.latitude,
    longitude: row.longitude,
    status: null,
    foundAt: row.found_at,
  };
}

export async function upsertBusinesses(
  businesses: Business[]
): Promise<void> {
  if (businesses.length === 0) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("businesses")
    .upsert(businesses.map(toBusinessRow), { onConflict: "id" });

  if (error) throw new Error(`Falha ao salvar empresas: ${error.message}`);
}

export async function listStoredBusinesses(options?: {
  minScore?: number;
  category?: CategoryId | "todas";
}): Promise<Business[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("businesses")
    .select("*")
    .gte("score", options?.minScore ?? 0)
    .order("score", { ascending: false })
    .order("found_at", { ascending: false });

  if (options?.category && options.category !== "todas") {
    query = query.eq("category", options.category);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar empresas: ${error.message}`);

  return ((data ?? []) as BusinessRow[]).map(fromBusinessRow);
}

export async function getStoredBusiness(
  id: string
): Promise<Business | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar empresa: ${error.message}`);
  return data ? fromBusinessRow(data as BusinessRow) : null;
}

export async function updateStoredBusinessContact(
  id: string,
  contact: { instagram: string | null; email: string | null }
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("businesses")
    .update({ ...contact, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`Falha ao atualizar empresa: ${error.message}`);
}

export async function recordBusinessSearch(
  filters: SearchFilters,
  provider: "google" | "geoapify" | "mock",
  businesses: Business[]
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { data: search, error: searchError } = await supabase
    .from("searches")
    .insert({
      city: filters.city,
      state: filters.state,
      radius_km: filters.radiusKm,
      category: filters.category,
      filters,
      results_count: businesses.length,
      provider,
    })
    .select("id")
    .single();

  if (searchError) {
    throw new Error(`Falha ao registrar busca: ${searchError.message}`);
  }

  if (businesses.length === 0) return;

  const searchId = (search as { id: string }).id;
  const { error: resultsError } = await supabase
    .from("search_results")
    .insert(
      businesses.map((business) => ({
        search_id: searchId,
        business_id: business.id,
      }))
    );

  if (resultsError) {
    throw new Error(
      `Falha ao relacionar resultados da busca: ${resultsError.message}`
    );
  }
}
