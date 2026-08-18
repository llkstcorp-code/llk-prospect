import {
  computeScore,
  deriveProblem,
  estimateValue,
  recommendServiceId,
} from "@/lib/prospecting";
import type { Business } from "@/types";
import { toCategoryId } from "./categories";
import type { PlaceAddressComponent, PlaceResource } from "./client";

function findComponent(
  components: PlaceAddressComponent[] | undefined,
  type: string
): PlaceAddressComponent | undefined {
  return components?.find((component) => component.types?.includes(type));
}

/** Remove o município e a UF do endereço completo, que já aparecem à parte. */
function toStreetAddress(formattedAddress: string | undefined): string {
  if (!formattedAddress) return "Endereço não informado";
  const [street] = formattedAddress.split(" - ");
  return street?.trim() || formattedAddress;
}

/**
 * Converte um lugar do Google no nosso domínio, calculando score, problema e
 * serviço recomendado — nada disso vem da API.
 *
 * `instagram` fica nulo porque a Places API não expõe redes sociais; ele é
 * preenchido depois pelo enriquecimento sob demanda.
 */
export function toBusiness(place: PlaceResource, foundAt: string): Business {
  const rating = place.rating ?? 0;
  const reviews = place.userRatingCount ?? 0;
  const website = place.websiteUri ?? null;

  const input = { rating, reviews, hasWebsite: Boolean(website) };
  const serviceId = recommendServiceId(input);

  const city =
    findComponent(place.addressComponents, "administrative_area_level_2")
      ?.longText ??
    findComponent(place.addressComponents, "locality")?.longText ??
    "";
  const state =
    findComponent(place.addressComponents, "administrative_area_level_1")
      ?.shortText ?? "";

  return {
    id: place.id,
    name: place.displayName?.text ?? "Empresa sem nome",
    category: toCategoryId(place.primaryType),
    city,
    state,
    address: toStreetAddress(place.formattedAddress),
    phone: place.nationalPhoneNumber ?? "Telefone não informado",
    rating,
    reviews,
    ratingAvailable: true,
    dataSource: "google",
    website,
    instagram: null,
    score: computeScore(input),
    problem: deriveProblem(input),
    recommendedServiceId: serviceId,
    estimatedValue: estimateValue(serviceId),
    status: null,
    foundAt,
  };
}
