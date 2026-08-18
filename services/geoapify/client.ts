const GEOAPIFY_ENDPOINT = "https://api.geoapify.com";
const REQUEST_TIMEOUT_MS = 12_000;

export interface GeoapifyProperties {
  place_id?: string;
  feature_type?: string;
  details?: string[];
  name?: string;
  categories?: string[];
  formatted?: string;
  address_line1?: string;
  city?: string;
  county?: string;
  state?: string;
  state_code?: string;
  country_code?: string;
  lat?: number;
  lon?: number;
  website?: string;
  contact?: { phone?: string };
  /** Tags cruas do OpenStreetMap: marca, endereço detalhado e afins. */
  datasource?: { raw?: Record<string, unknown> };
}

export interface GeoapifyFeature {
  type: "Feature";
  properties: GeoapifyProperties;
  geometry?: { type: string; coordinates: number[] };
}

interface FeatureCollection {
  features?: GeoapifyFeature[];
}

interface GeocodeResult extends GeoapifyProperties {
  place_id: string;
  lat: number;
  lon: number;
}

interface GeocodeResponse {
  results?: GeocodeResult[];
}

export function getGeoapifyApiKey(): string | undefined {
  return process.env.GEOAPIFY_API_KEY?.trim() || undefined;
}

async function requestJson<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const apiKey = getGeoapifyApiKey();
  if (!apiKey) throw new Error("GEOAPIFY_API_KEY não configurada.");

  const query = new URLSearchParams({ ...params, apiKey });
  const response = await fetch(`${GEOAPIFY_ENDPOINT}${path}?${query}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Geoapify respondeu ${response.status}: ${detail.slice(0, 300)}`
    );
  }

  return (await response.json()) as T;
}

const geocodeCache = new Map<string, GeocodeResult | null>();

export async function geocodeCity(
  city: string,
  state: string
): Promise<GeocodeResult | null> {
  const cacheKey = `${city.toLocaleLowerCase("pt-BR")}|${state}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const response = await requestJson<GeocodeResponse>("/v1/geocode/search", {
    text: `${city}, ${state}, Brasil`,
    type: "city",
    filter: "countrycode:br",
    format: "json",
    limit: "1",
    lang: "pt",
  });

  const result = response.results?.[0] ?? null;
  geocodeCache.set(cacheKey, result);
  return result;
}

function mergeAlternating(
  groups: GeoapifyFeature[][],
  limit: number
): GeoapifyFeature[] {
  const merged: GeoapifyFeature[] = [];
  const seen = new Set<string>();
  const depth = Math.max(0, ...groups.map((group) => group.length));

  for (let index = 0; index < depth && merged.length < limit; index += 1) {
    for (const group of groups) {
      const feature = group[index];
      if (!feature) continue;

      const id = feature.properties.place_id;
      if (id) {
        if (seen.has(id)) continue;
        seen.add(id);
      }

      merged.push(feature);
      if (merged.length >= limit) break;
    }
  }

  return merged;
}

export async function searchPlaces(input: {
  categories: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}): Promise<GeoapifyFeature[]> {
  const radius = Math.round(input.radiusKm * 1000);
  const limit = input.limit ?? 40;
  const groups = input.categories
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);

  // A Geoapify intersecta em vez de unir quando categorias de grupos
  // diferentes vão na mesma requisição: "accommodation,catering" numa cidade
  // com um único hotel devolve só esse hotel. Buscamos cada grupo isolado e
  // unimos aqui, alternando entre eles para não enviesar o corte pelo limite.
  const settled = await Promise.allSettled(
    groups.map(async (category) => {
      const response = await requestJson<FeatureCollection>("/v2/places", {
        categories: category,
        filter: `circle:${input.longitude},${input.latitude},${radius}`,
        bias: `proximity:${input.longitude},${input.latitude}`,
        limit: String(limit),
        lang: "pt",
      });
      return response.features ?? [];
    })
  );

  const fulfilled = settled.filter(
    (result): result is PromiseFulfilledResult<GeoapifyFeature[]> =>
      result.status === "fulfilled"
  );

  // Uma categoria que falha não pode derrubar a busca inteira, mas se todas
  // falharem o erro precisa subir em vez de virar "nenhum resultado".
  if (fulfilled.length === 0) {
    const firstRejection = settled.find(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    );
    if (firstRejection) throw firstRejection.reason;
    return [];
  }

  return mergeAlternating(
    fulfilled.map((result) => result.value),
    limit
  );
}

const detailsCache = new Map<string, GeoapifyFeature | null>();

export async function placeDetails(
  placeId: string
): Promise<GeoapifyFeature | null> {
  const cached = detailsCache.get(placeId);
  if (cached !== undefined) return cached;

  try {
    const response = await requestJson<FeatureCollection>("/v2/place-details", {
      id: placeId,
      features: "details",
      lang: "pt",
    });
    const result =
      response.features?.find(
        (feature) => feature.properties.feature_type === "details"
      ) ?? response.features?.[0] ?? null;
    detailsCache.set(placeId, result);
    return result;
  } catch {
    detailsCache.set(placeId, null);
    return null;
  }
}

