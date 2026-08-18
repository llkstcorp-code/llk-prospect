import {
  deriveGeoapifyProblem,
  computeGeoapifyScore,
  estimateValue,
  recommendGeoapifyServiceId,
} from "@/lib/prospecting";
import type { Business } from "@/types";
import { toCategoryId } from "./categories";
import type { GeoapifyFeature } from "./client";

export function toBusiness(
  feature: GeoapifyFeature,
  foundAt: string,
  fallbackId?: string
): Business {
  const place = feature.properties;
  const website = place.website ?? null;
  const phone = place.contact?.phone ?? null;
  const category = toCategoryId(place.categories);
  const scoreInput = {
    hasWebsite: Boolean(website),
    hasPhone: Boolean(phone),
    hasAddress: Boolean(place.address_line1 || place.formatted),
    category,
  };
  const serviceId = recommendGeoapifyServiceId(scoreInput);

  return {
    id: place.place_id ?? fallbackId ?? "geoapify-sem-id",
    name: place.name ?? "Empresa sem nome",
    category,
    city: place.city ?? place.county ?? "",
    state: (place.state_code ?? place.state ?? "").toUpperCase(),
    address: place.address_line1 ?? place.formatted ?? "Endereço não informado",
    phone: phone ?? "Telefone não informado",
    rating: 0,
    reviews: 0,
    ratingAvailable: false,
    dataSource: "geoapify",
    website,
    instagram: null,
    latitude: feature.geometry?.coordinates[1] ?? null,
    longitude: feature.geometry?.coordinates[0] ?? null,
    score: computeGeoapifyScore(scoreInput),
    problem: deriveGeoapifyProblem(scoreInput),
    recommendedServiceId: serviceId,
    estimatedValue: estimateValue(serviceId),
    status: null,
    foundAt,
  };
}
