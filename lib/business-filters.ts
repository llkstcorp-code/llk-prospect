import { parseDate } from "@/lib/format";
import type {
  Business,
  BusinessSort,
  PresenceFilter,
  SearchFilters,
} from "@/types";

/**
 * Filtros e ordenação aplicados aos resultados de busca. Ficam aqui porque são
 * usados tanto no servidor (route handlers) quanto no cliente (reordenação
 * instantânea da tabela, sem refazer a busca).
 */

function matchesPresence(value: string | null, filter: PresenceFilter): boolean {
  if (filter === "qualquer") return true;
  return filter === "sim" ? Boolean(value) : !value;
}

/**
 * Critérios de qualificação (nota, avaliações, score e presença digital).
 *
 * Separado da localização porque, na busca ao vivo, cidade e segmento já foram
 * delegados ao Google — reaplicá-los aqui descartaria resultados válidos que a
 * nossa tabela de tipos não soube classificar.
 */
export function matchesCriteria(
  business: Business,
  filters: SearchFilters
): boolean {
  if (business.ratingAvailable !== false) {
    if (business.rating < filters.minRating) return false;
    if (business.reviews < filters.minReviews) return false;
  }
  if (business.score < filters.minScore) return false;
  if (!matchesPresence(business.website, filters.hasWebsite)) return false;
  if (!matchesPresence(business.instagram, filters.hasInstagram)) return false;
  return true;
}

/** Critérios + localização e segmento — usado sobre a base mockada. */
export function matchesFilters(
  business: Business,
  filters: SearchFilters
): boolean {
  if (filters.city.trim()) {
    const city = filters.city.trim().toLocaleLowerCase("pt-BR");
    if (!business.city.toLocaleLowerCase("pt-BR").includes(city)) return false;
  }
  if (filters.state && business.state !== filters.state) return false;
  if (filters.category !== "todas" && business.category !== filters.category) {
    return false;
  }
  return matchesCriteria(business, filters);
}

export function sortBusinesses(
  businesses: Business[],
  sort: BusinessSort
): Business[] {
  const sorted = [...businesses];

  switch (sort) {
    case "avaliacoes":
      return sorted.sort((a, b) => b.reviews - a.reviews);
    case "melhor-avaliacao":
      return sorted.sort((a, b) => b.rating - a.rating || b.score - a.score);
    case "recentes":
      return sorted.sort(
        (a, b) => parseDate(b.foundAt).getTime() - parseDate(a.foundAt).getTime()
      );
    case "oportunidade":
    default:
      return sorted.sort((a, b) => b.score - a.score);
  }
}
