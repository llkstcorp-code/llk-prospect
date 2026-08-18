import type { Lead, LeadStatus } from "@/types";
import { API_ENDPOINTS } from "./api";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? `Requisição falhou: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getLeads(): Promise<Lead[]> {
  return request<Lead[]>(API_ENDPOINTS.leads);
}

export async function getLead(id: string): Promise<Lead | null> {
  try {
    return await request<Lead>(API_ENDPOINTS.lead(id));
  } catch {
    return null;
  }
}

export async function getLeadByBusinessId(
  businessId: string
): Promise<Lead | null> {
  const leads = await getLeads();
  return leads.find((lead) => lead.businessId === businessId) ?? null;
}

export async function createLead(businessId: string): Promise<Lead> {
  return request<Lead>(API_ENDPOINTS.leads, {
    method: "POST",
    body: JSON.stringify({ businessId }),
  });
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<Lead> {
  return request<Lead>(API_ENDPOINTS.lead(id), {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function addLeadNote(
  id: string,
  content: string
): Promise<Lead> {
  return request<Lead>(API_ENDPOINTS.lead(id), {
    method: "PATCH",
    body: JSON.stringify({ note: content }),
  });
}

export async function registerLeadContact(id: string): Promise<Lead> {
  return request<Lead>(API_ENDPOINTS.lead(id), {
    method: "PATCH",
    body: JSON.stringify({ registerContact: true }),
  });
}
