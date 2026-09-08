import "server-only";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Contact, ContactInput } from "@/types";

interface ContactRow {
  id: string;
  business_id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_primary: boolean;
  notes: string;
  created_at: string;
}

function fromRow(row: ContactRow): Contact {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    isPrimary: row.is_primary,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function toRow(input: ContactInput) {
  return {
    business_id: input.businessId,
    name: input.name.trim(),
    role: input.role.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    is_primary: input.isPrimary,
    notes: input.notes.trim(),
  };
}

/**
 * Libera o cargo de principal antes de dar a outro contato.
 *
 * O índice único parcial no banco recusaria o segundo principal, então a troca
 * precisa acontecer nesta ordem — e não é uma verificação de cortesia: é o que
 * faz a operação passar.
 */
async function clearPrimary(
  businessId: string,
  exceptId?: string
): Promise<void> {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("contacts")
    .update({ is_primary: false, updated_at: new Date().toISOString() })
    .eq("business_id", businessId)
    .eq("is_primary", true);

  if (exceptId) query = query.neq("id", exceptId);

  const { error } = await query;
  if (error) {
    throw new Error(`Falha ao trocar o contato principal: ${error.message}`);
  }
}

export async function listStoredContacts(
  businessId: string
): Promise<Contact[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("business_id", businessId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Falha ao listar contatos: ${error.message}`);
  return ((data ?? []) as ContactRow[]).map(fromRow);
}

export async function createStoredContact(
  input: ContactInput
): Promise<Contact> {
  const user = await requireUser();

  // O primeiro contato de uma empresa é o principal, mesmo sem marcar: uma
  // empresa com um contato só e nenhum principal não faz sentido.
  const existing = await listStoredContacts(input.businessId);
  const isPrimary = input.isPrimary || existing.length === 0;

  if (isPrimary) await clearPrimary(input.businessId);

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...toRow({ ...input, isPrimary }), created_by: user.id })
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao cadastrar contato: ${error.message}`);
  return fromRow(data as ContactRow);
}

export async function updateStoredContact(
  id: string,
  input: ContactInput
): Promise<Contact> {
  if (input.isPrimary) await clearPrimary(input.businessId, id);

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contacts")
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao atualizar contato: ${error.message}`);
  return fromRow(data as ContactRow);
}

export async function deleteStoredContact(id: string): Promise<void> {
  const supabase = await getSupabaseServerClient();

  // Apagar o principal deixaria a empresa sem contato padrão. O mais antigo
  // dos restantes assume, para que a abordagem continue tendo a quem se dirigir.
  const { data: removed } = await supabase
    .from("contacts")
    .select("business_id, is_primary")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw new Error(`Falha ao remover contato: ${error.message}`);

  const row = removed as Pick<ContactRow, "business_id" | "is_primary"> | null;
  if (!row?.is_primary) return;

  const remaining = await listStoredContacts(row.business_id);
  const successor = remaining[0];
  if (!successor) return;

  const { error: promoteError } = await supabase
    .from("contacts")
    .update({ is_primary: true, updated_at: new Date().toISOString() })
    .eq("id", successor.id);

  if (promoteError) {
    throw new Error(
      `Contato removido, mas nenhum principal assumiu: ${promoteError.message}`
    );
  }
}
