export type BusinessesProvider = "geoapify" | "google" | "mock";

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

/**
 * Resolve a fonte de dados no servidor. Quando a fonte solicitada não possui
 * chave, retorna mocks para manter a V1 funcional.
 */
export function getBusinessesProvider(): BusinessesProvider {
  const requested = process.env.BUSINESSES_PROVIDER?.trim().toLowerCase();

  if (requested === "geoapify") {
    return hasValue(process.env.GEOAPIFY_API_KEY) ? "geoapify" : "mock";
  }

  if (requested === "google") {
    return hasValue(process.env.GOOGLE_MAPS_API_KEY) ? "google" : "mock";
  }

  if (hasValue(process.env.GOOGLE_MAPS_API_KEY)) return "google";
  if (hasValue(process.env.GEOAPIFY_API_KEY)) return "geoapify";
  return "mock";
}

