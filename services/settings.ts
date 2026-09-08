import { MOCK_PROSPECTING_PREFERENCES } from "@/data/mockSettings";
import type {
  ProspectingPreferences,
  ServiceOffering,
  Settings,
  UserProfile,
} from "@/types";
import { API_ENDPOINTS } from "./api";

/**
 * Perfil, preferências e catálogo do usuário logado.
 *
 * Tudo vem do servidor: o perfil e as preferências de `/api/perfil`, ligados à
 * sessão, e os serviços de `/api/services`. `MOCK_PROSPECTING_PREFERENCES` fica
 * apenas como valor inicial de quem nunca salvou preferência nenhuma.
 */

interface ProfileResponse {
  profile: UserProfile;
  preferences: Partial<ProspectingPreferences>;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new Error(`Requisição falhou: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function withDefaults(
  preferences: Partial<ProspectingPreferences>
): ProspectingPreferences {
  return { ...MOCK_PROSPECTING_PREFERENCES, ...preferences };
}

export async function getProfile(): Promise<{
  profile: UserProfile;
  prospecting: ProspectingPreferences;
}> {
  const data = await request<ProfileResponse>(API_ENDPOINTS.profile);
  return {
    profile: data.profile,
    prospecting: withDefaults(data.preferences),
  };
}

export async function getSettings(): Promise<Settings> {
  const [{ profile, prospecting }, services] = await Promise.all([
    getProfile(),
    request<ServiceOffering[]>(API_ENDPOINTS.services),
  ]);

  return { profile, prospecting, services };
}

export async function updateProfile(next: UserProfile): Promise<UserProfile> {
  const data = await request<ProfileResponse>(API_ENDPOINTS.profile, {
    method: "PATCH",
    body: JSON.stringify({ profile: next }),
  });
  return data.profile;
}

export async function updateProspectingPreferences(
  next: ProspectingPreferences
): Promise<ProspectingPreferences> {
  const data = await request<ProfileResponse>(API_ENDPOINTS.profile, {
    method: "PATCH",
    body: JSON.stringify({ preferences: next }),
  });
  return withDefaults(data.preferences);
}

export async function createService(
  input: Omit<ServiceOffering, "id">
): Promise<ServiceOffering> {
  return request<ServiceOffering>(API_ENDPOINTS.services, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateService(
  id: string,
  input: Omit<ServiceOffering, "id">
): Promise<ServiceOffering> {
  return request<ServiceOffering>(API_ENDPOINTS.service(id), {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteService(id: string): Promise<void> {
  return request<void>(API_ENDPOINTS.service(id), { method: "DELETE" });
}
