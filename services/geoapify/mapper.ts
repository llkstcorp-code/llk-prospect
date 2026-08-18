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
  const raw = place.datasource?.raw ?? {};
  const scoreInput = {
    hasWebsite: Boolean(website),
    // Sem ficha de detalhes a Geoapify não consultou site nenhum, então a
    // ausência não pode ser lida como "essa empresa não tem site".
    websiteChecked: (place.details?.length ?? 0) > 0,
    hasPhone: Boolean(phone),
    hasStreetAddress: Boolean(raw["addr:street"] && raw["addr:housenumber"]),
    hasAddress: Boolean(place.address_line1 || place.formatted),
    isChain: Boolean(raw.brand || raw["brand:wikidata"] || raw.operator),
    hasName: Boolean(place.name),
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
