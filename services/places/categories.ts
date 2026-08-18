import type { CategoryId } from "@/types";

/**
 * Ponte entre os segmentos da LLK e os tipos de lugar do Google.
 * Referência: https://developers.google.com/maps/documentation/places/web-service/place-types
 */

/** Tipo enviado em `includedType` para restringir a busca. */
export const CATEGORY_TO_PLACE_TYPE: Record<CategoryId, string | null> = {
  restaurante: "restaurant",
  pizzaria: "pizza_restaurant",
  pousada: "bed_and_breakfast",
  hotel: "hotel",
  academia: "gym",
  clinica: "doctor",
  dentista: "dentist",
  imobiliaria: "real_estate_agency",
  loja: "store",
  oficina: "car_repair",
  construcao: "general_contractor",
  prestador: "consultant",
  outros: null,
};

/**
 * Caminho inverso: o `primaryType` devolvido pelo Google vira um segmento
 * nosso. Tipos não mapeados caem em "outros".
 */
const PLACE_TYPE_TO_CATEGORY: Record<string, CategoryId> = {
  restaurant: "restaurante",
  fine_dining_restaurant: "restaurante",
  brazilian_restaurant: "restaurante",
  steak_house: "restaurante",
  hamburger_restaurant: "restaurante",
  japanese_restaurant: "restaurante",
  pizza_restaurant: "pizzaria",
  bed_and_breakfast: "pousada",
  guest_house: "pousada",
  inn: "pousada",
  cottage: "pousada",
  farmstay: "pousada",
  hotel: "hotel",
  resort_hotel: "hotel",
  motel: "hotel",
  lodging: "hotel",
  extended_stay_hotel: "hotel",
  gym: "academia",
  fitness_center: "academia",
  yoga_studio: "academia",
  doctor: "clinica",
  hospital: "clinica",
  medical_lab: "clinica",
  physiotherapist: "clinica",
  chiropractor: "clinica",
  wellness_center: "clinica",
  dentist: "dentista",
  dental_clinic: "dentista",
  real_estate_agency: "imobiliaria",
  store: "loja",
  clothing_store: "loja",
  furniture_store: "loja",
  home_goods_store: "loja",
  shoe_store: "loja",
  jewelry_store: "loja",
  pet_store: "loja",
  book_store: "loja",
  hardware_store: "loja",
  grocery_store: "loja",
  supermarket: "loja",
  car_repair: "oficina",
  car_wash: "oficina",
  car_dealer: "oficina",
  auto_parts_store: "oficina",
  general_contractor: "construcao",
  roofing_contractor: "construcao",
  electrician: "construcao",
  plumber: "construcao",
  painter: "construcao",
  consultant: "prestador",
  accounting: "prestador",
  lawyer: "prestador",
  insurance_agency: "prestador",
  barber_shop: "prestador",
  hair_salon: "prestador",
  beauty_salon: "prestador",
  nail_salon: "prestador",
  travel_agency: "prestador",
  veterinary_care: "prestador",
};

export function toCategoryId(placeType: string | undefined): CategoryId {
  if (!placeType) return "outros";
  return PLACE_TYPE_TO_CATEGORY[placeType] ?? "outros";
}
