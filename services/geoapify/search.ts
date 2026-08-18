import type { Business, SearchFilters } from "@/types";
import {
  ALL_GEOAPIFY_CATEGORIES,
  GEOAPIFY_CATEGORIES,
} from "./categories";
import { geocodeCity, placeDetails, searchPlaces } from "./client";
import type { GeoapifyFeature } from "./client";
import { toBusiness } from "./mapper";

// A Geoapify aceita ate 500 por requisicao. Mantemos um teto porque cada
// resultado enriquecido custa uma chamada extra de /v2/place-details, e uma
// capital inteira estouraria a cota diaria numa unica busca.
const RESULT_LIMIT = 200;
const DETAILS_CONCURRENCY = 4;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function enrichInBatches(
  features: Awaited<ReturnType<typeof searchPlaces>>
): Promise<Awaited<ReturnType<typeof searchPlaces>>> {
  const enriched: GeoapifyFeature[] = [];

  for (let start = 0; start < features.length; start += DETAILS_CONCURRENCY) {
    const batch = features.slice(start, start + DETAILS_CONCURRENCY);
    const values = await Promise.all(
      batch.map(async (feature) => {
        const id = feature.properties.place_id;
        if (!id) return feature;
        // details vazio significa que a Geoapify nao tem nada alem do que ja
        // veio em /v2/places: a chamada extra so gastaria cota.
        if (feature.properties.details?.length === 0) return feature;
        const details = await placeDetails(id);
        if (!details) return feature;
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...details.properties,
            place_id: id,
            categories:
              details.properties.categories ?? feature.properties.categories,
          },
        };
      })
    );
    enriched.push(...values);
  }

  return enriched;
}

export async function searchGeoapifyBusinesses(
  filters: SearchFilters
): Promise<Business[]> {
  const center = await geocodeCity(filters.city, filters.state);
  if (!center) return [];

  const categories =
    filters.category === "todas"
      ? ALL_GEOAPIFY_CATEGORIES
      : GEOAPIFY_CATEGORIES[filters.category];

  const features = await searchPlaces({
    categories,
    latitude: center.lat,
    longitude: center.lon,
    radiusKm: filters.radiusKm,
    limit: RESULT_LIMIT,
  });
  const enriched = await enrichInBatches(features);
  const foundAt = today();

  return enriched.map((feature) => toBusiness(feature, foundAt));
}

export async function getGeoapifyBusiness(
  placeId: string
): Promise<Business | null> {
  const details = await placeDetails(placeId);
  return details ? toBusiness(details, today(), placeId) : null;
}
