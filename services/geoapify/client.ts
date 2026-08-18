const GEOAPIFY_ENDPOINT = "https://api.geoapify.com";
const REQUEST_TIMEOUT_MS = 12_000;

export interface GeoapifyProperties {
  place_id?: string;
  feature_type?: string;
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

export async function searchPlaces(input: {
  categories: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}): Promise<GeoapifyFeature[]> {
  const radius = Math.round(input.radiusKm * 1000);
  const response = await requestJson<FeatureCollection>("/v2/places", {
    categories: input.categories,
    filter: `circle:${input.longitude},${input.latitude},${radius}`,
    bias: `proximity:${input.longitude},${input.latitude}`,
    limit: String(input.limit ?? 40),
    lang: "pt",
  });

  return response.features ?? [];
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

