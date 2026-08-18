/**
 * Cliente da Google Maps Platform. **Só pode ser importado no servidor** —
 * é aqui que a chave da API é lida, e ela nunca pode chegar ao navegador.
 *
 * Usa a Places API (New), que é REST puro e dispensa biblioteca cliente.
 */

const PLACES_ENDPOINT = "https://places.googleapis.com/v1";
const GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

/** Text Search devolve 20 por página e no máximo 60 no total. */
const PAGE_SIZE = 20;
const MAX_PAGES = 3;

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Campos pedidos ao Google. O custo da chamada depende desta lista — `rating`,
 * `userRatingCount` e `nationalPhoneNumber` são do SKU Enterprise.
 */
const PLACE_FIELDS = [
  "id",
  "displayName",
  "primaryType",
  "formattedAddress",
  "addressComponents",
  "rating",
  "userRatingCount",
  "websiteUri",
  "nationalPhoneNumber",
] as const;

export interface PlaceAddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

export interface PlaceResource {
  id: string;
  displayName?: { text?: string };
  primaryType?: string;
  formattedAddress?: string;
  addressComponents?: PlaceAddressComponent[];
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export function getApiKey(): string | undefined {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() || undefined;
}

/** Sem chave configurada o sistema inteiro continua rodando com os mocks. */
export function isLiveDataEnabled(): boolean {
  return Boolean(getApiKey());
}

async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...requestInit } = init;

  const response = await fetch(url, {
    ...requestInit,
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Google respondeu ${response.status} para ${url}: ${detail.slice(0, 300)}`
    );
  }

  return (await response.json()) as T;
}

interface GeocodeResponse {
  status: string;
  results?: { geometry?: { location?: { lat: number; lng: number } } }[];
}

/** Cache de coordenadas por cidade — evita pagar geocoding a cada busca. */
const geocodeCache = new Map<string, LatLng | null>();

export async function geocodeCity(
  city: string,
  state: string
): Promise<LatLng | null> {
  const key = getApiKey();
  if (!key) return null;

  const cacheKey = `${city.toLocaleLowerCase("pt-BR")}|${state}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const params = new URLSearchParams({
    address: `${city}, ${state}, Brasil`,
    region: "br",
    key,
  });

  const data = await fetchJson<GeocodeResponse>(
    `${GEOCODE_ENDPOINT}?${params.toString()}`
  );
  const location = data.results?.[0]?.geometry?.location;
  const result: LatLng | null = location
    ? { latitude: location.lat, longitude: location.lng }
    : null;

  geocodeCache.set(cacheKey, result);
  return result;
}

interface TextSearchResponse {
  places?: PlaceResource[];
  nextPageToken?: string;
}

export interface TextSearchParams {
  textQuery: string;
  includedType?: string | null;
  center?: LatLng | null;
  radiusKm?: number;
  /** Quantidade máxima de lugares desejada (o Google limita a 60). */
  limit?: number;
}

/**
 * Text Search (New). Preferido ao Nearby Search porque pagina até 60
 * resultados, enquanto o Nearby devolve no máximo 20 sem paginação.
 */
export async function textSearch({
  textQuery,
  includedType,
  center,
  radiusKm = 20,
  limit = PAGE_SIZE * MAX_PAGES,
}: TextSearchParams): Promise<PlaceResource[]> {
  const key = getApiKey();
  if (!key) return [];

  const places: PlaceResource[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < MAX_PAGES && places.length < limit; page += 1) {
    const body: Record<string, unknown> = {
      textQuery,
      pageSize: PAGE_SIZE,
      languageCode: "pt-BR",
      regionCode: "BR",
    };

    if (includedType) body.includedType = includedType;
    if (center) {
      body.locationBias = {
        circle: { center, radius: Math.round(radiusKm * 1000) },
      };
    }
    if (pageToken) body.pageToken = pageToken;

    const data = await fetchJson<TextSearchResponse>(
      `${PLACES_ENDPOINT}/places:searchText`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": [
            ...PLACE_FIELDS.map((field) => `places.${field}`),
            "nextPageToken",
          ].join(","),
        },
        body: JSON.stringify(body),
      }
    );

    places.push(...(data.places ?? []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return places.slice(0, limit);
}

/** Place Details — usado para reidratar uma empresa a partir do place ID. */
export async function placeDetails(
  placeId: string
): Promise<PlaceResource | null> {
  const key = getApiKey();
  if (!key) return null;

  try {
    return await fetchJson<PlaceResource>(
      `${PLACES_ENDPOINT}/places/${encodeURIComponent(placeId)}?languageCode=pt-BR&regionCode=BR`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": PLACE_FIELDS.join(","),
        },
      }
    );
  } catch {
    return null;
  }
}
