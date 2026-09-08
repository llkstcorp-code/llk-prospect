import type { Deal, DealInput, DealStatus } from "@/types";
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

export async function getDeals(): Promise<Deal[]> {
  return request<Deal[]>(API_ENDPOINTS.deals);
}

export async function getDeal(id: string): Promise<Deal | null> {
  try {
    return await request<Deal>(API_ENDPOINTS.deal(id));
  } catch {
    return null;
  }
}

export async function getDealsByBusinessId(
  businessId: string
): Promise<Deal[]> {
  const deals = await getDeals();
  return deals.filter((deal) => deal.businessId === businessId);
}

export async function createDeal(input: DealInput): Promise<Deal> {
  return request<Deal>(API_ENDPOINTS.deals, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateDealStatus(
  id: string,
  status: DealStatus
): Promise<Deal> {
  return request<Deal>(API_ENDPOINTS.deal(id), {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function addDealNote(
  id: string,
  content: string
): Promise<Deal> {
  return request<Deal>(API_ENDPOINTS.deal(id), {
    method: "PATCH",
    body: JSON.stringify({ note: content }),
  });
}

export async function registerDealContact(id: string): Promise<Deal> {
  return request<Deal>(API_ENDPOINTS.deal(id), {
    method: "PATCH",
    body: JSON.stringify({ registerContact: true }),
  });
}
