import "server-only";

import { requireUser } from "@/lib/auth/session";
import { AUTOMATIC_FOLLOWUP_DAYS, getTaskKindLabel } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DealStatus, Task, TaskInput, TaskKind } from "@/types";

interface TaskRow {
  id: string;
  owner_id: string;
  deal_id: string | null;
  business_id: string | null;
  contact_id: string | null;
  title: string;
  kind: TaskKind;
  due_at: string;
  done_at: string | null;
  is_automatic: boolean;
  created_at: string;
}

interface Lookups {
  owners: Map<string, string>;
  deals: Map<string, string>;
  businesses: Map<string, string>;
}

function mapTask(row: TaskRow, lookups: Lookups): Task {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: lookups.owners.get(row.owner_id) ?? "",
    dealId: row.deal_id,
    dealTitle: row.deal_id ? (lookups.deals.get(row.deal_id) ?? null) : null,
    businessId: row.business_id,
    businessName: row.business_id
      ? (lookups.businesses.get(row.business_id) ?? null)
      : null,
    title: row.title,
    kind: row.kind,
    dueAt: row.due_at,
    doneAt: row.done_at,
    isAutomatic: row.is_automatic,
    createdAt: row.created_at,
  };
}

/**
 * Busca os nomes que a tarefa referencia.
 *
 * Uma tarefa sem o nome do negócio e da empresa é ilegível na tela: "Follow-up"
 * não diz com quem. Isso vem em três consultas em lote, e não em uma por linha.
 */
async function loadLookups(rows: TaskRow[]): Promise<Lookups> {
  const empty: Lookups = {
    owners: new Map(),
    deals: new Map(),
    businesses: new Map(),
  };
  if (rows.length === 0) return empty;

  const supabase = await getSupabaseServerClient();
  const ownerIds = [...new Set(rows.map((row) => row.owner_id))];
  const dealIds = [
    ...new Set(rows.map((row) => row.deal_id).filter(Boolean)),
  ] as string[];
  const businessIds = [
    ...new Set(rows.map((row) => row.business_id).filter(Boolean)),
  ] as string[];

  const [profiles, deals, businesses] = await Promise.all([
    supabase.from("profiles").select("id, name").in("id", ownerIds),
    dealIds.length > 0
      ? supabase.from("deals").select("id, title").in("id", dealIds)
      : Promise.resolve({ data: [] }),
    businessIds.length > 0
      ? supabase.from("businesses").select("id, name").in("id", businessIds)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    owners: new Map(
      ((profiles.data ?? []) as Array<{ id: string; name: string }>).map(
        (row) => [row.id, row.name] as const
      )
    ),
    deals: new Map(
      ((deals.data ?? []) as Array<{ id: string; title: string }>).map(
        (row) => [row.id, row.title] as const
      )
    ),
    businesses: new Map(
      ((businesses.data ?? []) as Array<{ id: string; name: string }>).map(
        (row) => [row.id, row.name] as const
      )
    ),
  };
}

async function hydrate(rows: TaskRow[]): Promise<Task[]> {
  const lookups = await loadLookups(rows);
  return rows.map((row) => mapTask(row, lookups));
}

/**
 * Tarefas em aberto, mais as concluídas recentemente.
 *
 * A tela é sobre o que falta fazer, mas esconder na hora o que acabou de ser
 * concluído tira o retorno de ter marcado — e quem clicou por engano perde o
 * caminho de volta.
 */
export async function listStoredTasks(options?: {
  ownerId?: string;
}): Promise<Task[]> {
  const supabase = await getSupabaseServerClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("tasks")
    .select("*")
    .or(`done_at.is.null,done_at.gte.${since}`)
    .order("due_at", { ascending: true });

  if (options?.ownerId) query = query.eq("owner_id", options.ownerId);

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar tarefas: ${error.message}`);
  return hydrate((data ?? []) as TaskRow[]);
}

export async function listStoredTasksOfDeal(dealId: string): Promise<Task[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("deal_id", dealId)
    .order("due_at", { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar tarefas do negócio: ${error.message}`);
  }
  return hydrate((data ?? []) as TaskRow[]);
}

export async function createStoredTask(input: TaskInput): Promise<Task> {
  const user = await requireUser();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      owner_id: input.ownerId || user.id,
      deal_id: input.dealId ?? null,
      business_id: input.businessId ?? null,
      contact_id: input.contactId ?? null,
      title: input.title.trim() || getTaskKindLabel(input.kind),
      kind: input.kind,
      due_at: input.dueAt,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao criar tarefa: ${error.message}`);
  const [task] = await hydrate([data as TaskRow]);
  return task;
}

export async function setStoredTaskDone(
  id: string,
  done: boolean
): Promise<Task> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({
      done_at: done ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao atualizar tarefa: ${error.message}`);
  const [task] = await hydrate([data as TaskRow]);
  return task;
}

export async function deleteStoredTask(id: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(`Falha ao remover tarefa: ${error.message}`);
}

/**
 * Agenda o follow-up de uma etapa do funil.
 *
 * É a regra que faz o sistema cobrar o vendedor, e não o contrário: mover um
 * card para "Contatado" agenda a volta em três dias, sem ninguém precisar
 * lembrar de criar a tarefa.
 *
 * Falhar aqui não pode derrubar a mudança de etapa — a tarefa é consequência,
 * não a operação principal. O índice único do banco garante um follow-up
 * automático em aberto por negócio; a violação é esperada e ignorada.
 */
export async function scheduleAutomaticFollowUp(
  dealId: string,
  businessId: string,
  status: DealStatus,
  ownerId: string
): Promise<void> {
  const days = AUTOMATIC_FOLLOWUP_DAYS[status];
  if (!days) return;

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + days);

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("tasks").insert({
    owner_id: ownerId,
    deal_id: dealId,
    business_id: businessId,
    title:
      status === "proposta"
        ? "Cobrar retorno da proposta"
        : "Retomar contato",
    kind: "followup",
    due_at: dueAt.toISOString(),
    is_automatic: true,
  });

  // 23505 = já existe um follow-up automático em aberto para este negócio.
  if (error && error.code !== "23505") {
    console.warn(`Follow-up automático não agendado: ${error.message}`);
  }
}

/** Fecha o follow-up automático quando o negócio sai do funil. */
export async function closeAutomaticFollowUp(dealId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .update({ done_at: new Date().toISOString() })
    .eq("deal_id", dealId)
    .eq("is_automatic", true)
    .is("done_at", null);

  if (error) {
    console.warn(`Follow-up automático não encerrado: ${error.message}`);
  }
}
