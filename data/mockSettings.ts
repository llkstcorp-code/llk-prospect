import type { ProspectingPreferences, UserProfile } from "@/types";

/**
 * Conta usada enquanto não há autenticação real. É uma conta da LLK, não uma
 * pessoa fictícia — os dados podem ser editados em /configuracoes.
 */
export const MOCK_USER: UserProfile = {
  name: "LLK Digital",
  email: "contato@llk.com.br",
  company: "LLK",
  role: "Comercial",
  initials: "LLK",
};

export const MOCK_PROSPECTING_PREFERENCES: ProspectingPreferences = {
  defaultCity: "Passos",
  defaultState: "MG",
  defaultRadiusKm: 20,
  favoriteCategories: ["pousada", "restaurante", "clinica"],
  minScore: 70,
};
