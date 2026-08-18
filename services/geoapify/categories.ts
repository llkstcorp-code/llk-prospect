import type { CategoryId } from "@/types";

export const GEOAPIFY_CATEGORIES: Record<CategoryId, string> = {
  restaurante: "catering.restaurant",
  pizzaria: "catering.restaurant.pizza",
  pousada: "accommodation.guest_house,accommodation.hostel",
  hotel: "accommodation.hotel",
  academia: "sport.fitness",
  clinica: "healthcare.clinic",
  dentista: "healthcare.dentist",
  imobiliaria: "commercial.estate_agent",
  loja: "commercial",
  oficina: "service.vehicle.repair",
  construcao: "commercial.trade,service",
  prestador: "service",
  outros: "commercial,service",
};

export const ALL_GEOAPIFY_CATEGORIES = [
  "catering",
  "accommodation",
  "commercial",
  "healthcare",
  "service",
  "sport.fitness",
].join(",");

const CATEGORY_RULES: Array<[string, CategoryId]> = [
  ["catering.restaurant.pizza", "pizzaria"],
  ["catering.restaurant", "restaurante"],
  ["catering", "restaurante"],
  ["accommodation.hotel", "hotel"],
  ["accommodation.guest_house", "pousada"],
  ["accommodation.hostel", "pousada"],
  ["accommodation", "pousada"],
  ["sport.fitness", "academia"],
  ["healthcare.dentist", "dentista"],
  ["healthcare.clinic", "clinica"],
  ["healthcare", "clinica"],
  ["commercial.estate_agent", "imobiliaria"],
  ["service.vehicle.repair", "oficina"],
  ["commercial.trade", "construcao"],
  ["commercial", "loja"],
  ["service", "prestador"],
];

export function toCategoryId(categories: string[] | undefined): CategoryId {
  if (!categories) return "outros";

  for (const [prefix, category] of CATEGORY_RULES) {
    if (categories.some((value) => value === prefix || value.startsWith(`${prefix}.`))) {
      return category;
    }
  }

  return "outros";
}
