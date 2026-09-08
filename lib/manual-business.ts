import {
  computeGeoapifyScore,
  deriveGeoapifyProblem,
  estimateValue,
  recommendGeoapifyServiceId,
} from "@/lib/prospecting";
import type { ServiceCatalog } from "@/lib/service-catalog";
import type { Business, ManualBusinessInput } from "@/types";

/**
 * Converte o formulário de cadastro manual em uma empresa do domínio.
 *
 * O score sai das mesmas regras usadas para a Geoapify — as que funcionam sem
 * nota e sem avaliações. A diferença é que aqui `websiteChecked` é sempre
 * verdadeiro: quem preencheu o formulário olhou e respondeu se a empresa tem
 * site, o que é uma informação melhor do que qualquer fonte pública oferece.
 */

/** Aceita "instagram.com/loja", "@loja" ou o endereço completo. */
function normalizeUrl(value: string, base: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("@")) return `${base}${trimmed.slice(1)}`;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function normalizeWebsite(value: string): string | null {
  return normalizeUrl(value, "https://");
}

export function normalizeInstagram(value: string): string | null {
  return normalizeUrl(value, "https://instagram.com/");
}

export interface ManualBusinessOptions {
  id: string;
  foundAt: string;
}

export function toManualBusiness(
  input: ManualBusinessInput,
  catalog: ServiceCatalog,
  { id, foundAt }: ManualBusinessOptions
): Business {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();
  const city = input.city.trim();

  // A presença é o que a pessoa marcou; a URL é opcional. Marcar "tem site" sem
  // informar o endereço continua valendo como "tem site" para o score.
  const website = input.hasWebsite ? normalizeWebsite(input.website) : null;
  const instagram = input.hasInstagram
    ? normalizeInstagram(input.instagram)
    : null;

  const scoreInput = {
    hasWebsite: input.hasWebsite,
    websiteChecked: true,
    hasPhone: Boolean(phone),
    hasStreetAddress: Boolean(address),
    hasAddress: Boolean(address || city),
    isChain: false,
    hasName: Boolean(name),
    category: input.category,
  };

  const serviceId = recommendGeoapifyServiceId(scoreInput);

  return {
    id,
    name: name || "Empresa sem nome",
    category: input.category,
    city,
    state: input.state.trim().toUpperCase(),
    address: address || "Endereço não informado",
    phone: phone || "Telefone não informado",
    rating: 0,
    reviews: 0,
    ratingAvailable: false,
    dataSource: "manual",
    website,
    instagram,
    latitude: null,
    longitude: null,
    score: computeGeoapifyScore(scoreInput),
    problem: deriveGeoapifyProblem(scoreInput),
    recommendedServiceId: serviceId,
    estimatedValue: estimateValue(serviceId, catalog),
    status: null,
    foundAt,
  };
}

/** Erros de preenchimento, no idioma de quem preencheu. */
export function validateManualBusiness(input: ManualBusinessInput): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push("Informe o nome da empresa.");
  if (!input.city.trim()) errors.push("Informe a cidade.");
  if (!/^[A-Za-z]{2}$/.test(input.state.trim())) {
    errors.push("Informe o estado com duas letras, como MG.");
  }
  return errors;
}
