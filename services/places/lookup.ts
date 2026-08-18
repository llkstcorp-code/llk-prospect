import { MOCK_BUSINESSES } from "@/data/mockBusinesses";
import { getGeoapifyBusiness } from "@/services/geoapify/search";
import { getBusinessesProvider } from "@/services/providers/businesses-provider";
import type { Business } from "@/types";
import { isLiveDataEnabled, placeDetails } from "./client";
import { toBusiness } from "./mapper";

/**
 * Resolve uma empresa por id, venha ela da base mockada (ids em slug) ou do
 * Google (place IDs). Os dois formatos nunca colidem, então a base local é
 * consultada primeiro por ser gratuita.
 */
export async function findBusinessById(id: string): Promise<Business | null> {
  const mock = MOCK_BUSINESSES.find((business) => business.id === id);
  if (mock) return mock;

  const provider = getBusinessesProvider();
  if (provider === "geoapify") return getGeoapifyBusiness(id);
  if (provider !== "google" || !isLiveDataEnabled()) return null;

  const place = await placeDetails(id);
  return place ? toBusiness(place, new Date().toISOString().slice(0, 10)) : null;
}
