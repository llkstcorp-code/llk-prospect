import {
  MOCK_PROSPECTING_PREFERENCES,
  MOCK_USER,
} from "@/data/mockSettings";
import type {
  ProspectingPreferences,
  ServiceOffering,
  Settings,
  UserProfile,
} from "@/types";
import { API_ENDPOINTS, clone, delay } from "./api";

let profile: UserProfile = clone(MOCK_USER);
let prospecting: ProspectingPreferences = clone(MOCK_PROSPECTING_PREFERENCES);

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

export async function getSettings(): Promise<Settings> {
  const services = await request<ServiceOffering[]>(API_ENDPOINTS.services);
  return {
    profile: clone(profile),
    prospecting: clone(prospecting),
    services,
  };
}

export async function updateProfile(next: UserProfile): Promise<UserProfile> {
  await delay(300);
  profile = clone(next);
  return clone(profile);
}

export async function updateProspectingPreferences(
  next: ProspectingPreferences
): Promise<ProspectingPreferences> {
  await delay(300);
  prospecting = clone(next);
  return clone(prospecting);
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
