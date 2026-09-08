import type { ProspectingPreferences } from "@/types";

/**
 * Preferências iniciais de prospecção.
 *
 * Valem para quem ainda não salvou nada em /configuracoes. A partir do primeiro
 * salvamento, as preferências vivem no perfil do usuário no banco.
 */
export const MOCK_PROSPECTING_PREFERENCES: ProspectingPreferences = {
  defaultCity: "Passos",
  defaultState: "MG",
  defaultRadiusKm: 20,
  favoriteCategories: ["pousada", "restaurante", "clinica"],
  minScore: 70,
};
