import { CATEGORIES } from "@/data/categories";
import type { Business, SearchFilters } from "@/types";
import { CATEGORY_TO_PLACE_TYPE } from "./categories";
import { geocodeCity, textSearch } from "./client";
import { toBusiness } from "./mapper";

/** Termo de busca em linguagem natural, como alguém digitaria no Maps. */
function buildTextQuery(filters: SearchFilters): string {
  const place = [filters.city, filters.state].filter(Boolean).join(", ");

  if (filters.category === "todas") {
    return `empresas em ${place}`;
  }

  const label =
    CATEGORIES.find((category) => category.id === filters.category)?.label ??
    "empresas";

  return `${label} em ${place}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Busca ao vivo na Places API. A localização vira coordenada pelo Geocoding
 * para que o raio escolhido na interface seja respeitado.
 */
export async function searchLiveBusinesses(
  filters: SearchFilters
): Promise<Business[]> {
  const center = filters.city
    ? await geocodeCity(filters.city, filters.state)
    : null;

  const places = await textSearch({
    textQuery: buildTextQuery(filters),
    includedType:
      filters.category === "todas"
        ? null
        : CATEGORY_TO_PLACE_TYPE[filters.category],
    center,
    radiusKm: filters.radiusKm,
  });

  const foundAt = today();
  return places.map((place) => toBusiness(place, foundAt));
}
