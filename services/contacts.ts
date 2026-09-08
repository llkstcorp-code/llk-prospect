import type { Contact, ContactInput } from "@/types";
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
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function getContacts(businessId: string): Promise<Contact[]> {
  return request<Contact[]>(API_ENDPOINTS.contactsOf(businessId));
}

export async function createContact(input: ContactInput): Promise<Contact> {
  return request<Contact>(API_ENDPOINTS.contacts, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateContact(
  id: string,
  input: ContactInput
): Promise<Contact> {
  return request<Contact>(API_ENDPOINTS.contact(id), {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteContact(id: string): Promise<void> {
  return request<void>(API_ENDPOINTS.contact(id), { method: "DELETE" });
}

/** O contato que a abordagem usa; o primeiro da lista quando não há principal. */
export function findPrimaryContact(contacts: Contact[]): Contact | null {
  return contacts.find((contact) => contact.isPrimary) ?? contacts[0] ?? null;
}
