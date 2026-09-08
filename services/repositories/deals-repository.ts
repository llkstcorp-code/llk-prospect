import "server-only";

import { requireUser } from "@/lib/auth/session";
import { getDealStatusConfig } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Business,
  DealInput,
  Deal,
  DealNote,
  DealStatus,
  TimelineEvent,
  TimelineEventType,
} from "@/types";
import { getStoredBusiness } from "./businesses-repository";
import { getStoredService } from "./services-repository";
import {
  closeAutomaticFollowUp,
  scheduleAutomaticFollowUp,
} from "./tasks-repository";

interface DealRow {
  id: string;
  business_id: string;
  title: string;
  service_id: string | null;
  service_name: string;
  estimated_value: number | string;
  status: DealStatus;
  created_at: string;
  last_contact_at: string | null;
  closed_at: string | null;
  lost_reason: string | null;
  contact_id: string | null;
}

/** Status a partir dos quais o negócio deixa de estar em aberto. */
const CLOSED_STATUSES: DealStatus[] = ["fechado", "perdido"];

interface EventRow {
  id: string;
  deal_id: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  created_at: string;
}

interface NoteRow {
  id: string;
  deal_id: string;
  content: string;
  created_at: string;
}

const STATUS_EVENT_TYPE: Record<DealStatus, TimelineEventType> = {
  novo: "created",
  contatado: "contact",
  respondeu: "reply",
  reuniao: "meeting",
  proposta: "proposal",
  fechado: "won",
  perdido: "lost",
};

const CONTACT_STATUSES: DealStatus[] = [
  "contatado",
  "respondeu",
  "reuniao",
  "proposta",
  "fechado",
];

function mapEvent(row: EventRow): TimelineEvent {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    date: row.created_at,
  };
}

function mapNote(row: NoteRow): DealNote {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapDeal(
  row: DealRow,
  business: Business,
  events: EventRow[],
  notes: NoteRow[],
  contactNames: Map<string, string>
): Deal {
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: business.name,
    title: row.title || row.service_name,
    category: business.category,
    city: business.city,
    state: business.state,
    score: business.score,
    problem: business.problem,
    serviceId: row.service_id ?? business.recommendedServiceId,
    serviceName: row.service_name,
    estimatedValue: Number(row.estimated_value),
    status: row.status,
    createdAt: row.created_at,
    lastContactAt: row.last_contact_at,
    closedAt: row.closed_at,
    lostReason: row.lost_reason,
    contactId: row.contact_id,
    contactName: row.contact_id
      ? (contactNames.get(row.contact_id) ?? null)
      : null,
    timeline: events.map(mapEvent),
    notes: notes.map(mapNote),
  };
}

async function loadDealRelations(rows: DealRow[]): Promise<Deal[]> {
  if (rows.length === 0) return [];

  const supabase = await getSupabaseServerClient();
  const businessIds = [...new Set(rows.map((row) => row.business_id))];
  const dealIds = rows.map((row) => row.id);

  const contactIds = [
    ...new Set(rows.map((row) => row.contact_id).filter(Boolean)),
  ] as string[];

  const [businessesResult, eventsResult, notesResult, contactsResult] =
    await Promise.all([
      supabase.from("businesses").select("*").in("id", businessIds),
      supabase
        .from("deal_events")
        .select("*")
        .in("deal_id", dealIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("deal_notes")
        .select("*")
        .in("deal_id", dealIds)
        .order("created_at", { ascending: false }),
      contactIds.length > 0
        ? supabase.from("contacts").select("id, name").in("id", contactIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const relationError =
    businessesResult.error ?? eventsResult.error ?? notesResult.error;
  if (relationError) {
    throw new Error(`Falha ao carregar dados dos deals: ${relationError.message}`);
  }

  const businesses = new Map(
    ((businessesResult.data ?? []) as Array<Record<string, unknown>>).map(
      (record) => {
        const row = record as Record<string, unknown>;
        const business: Business = {
          id: String(row.id),
          name: String(row.name),
          category: row.category as Business["category"],
          city: String(row.city),
          state: String(row.state),
          address: String(row.address),
          phone: String(row.phone),
          rating: Number(row.rating),
          reviews: Number(row.reviews),
          ratingAvailable: Boolean(row.rating_available),
          dataSource: row.data_source as Business["dataSource"],
          website: row.website ? String(row.website) : null,
          instagram: row.instagram ? String(row.instagram) : null,
          email: row.email ? String(row.email) : null,
          score: Number(row.score),
          problem: String(row.problem),
          recommendedServiceId: String(
            row.recommended_service_id ?? "site-profissional"
          ),
          estimatedValue: Number(row.estimated_value),
          latitude: row.latitude == null ? null : Number(row.latitude),
          longitude: row.longitude == null ? null : Number(row.longitude),
          status: null,
          foundAt: String(row.found_at),
        };
        return [business.id, business] as const;
      }
    )
  );
  const events = (eventsResult.data ?? []) as EventRow[];
  const notes = (notesResult.data ?? []) as NoteRow[];
  const contactNames = new Map(
    ((contactsResult.data ?? []) as Array<{ id: string; name: string }>).map(
      (contact) => [contact.id, contact.name] as const
    )
  );

  return rows.flatMap((row) => {
    const business = businesses.get(row.business_id);
    if (!business) {
      // Some da lista para não quebrar as outras, mas deixa rastro: um deal que
      // desaparece em silêncio é o tipo de falha que se investiga às cegas.
      console.warn(
        `Deal ${row.id} ignorado: empresa ${row.business_id} não foi encontrada.`
      );
      return [];
    }
    return [
      mapDeal(
        row,
        business,
        events.filter((event) => event.deal_id === row.id),
        notes.filter((note) => note.deal_id === row.id),
        contactNames
      ),
    ];
  });
}

export async function listStoredDeals(): Promise<Deal[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao listar negócios: ${error.message}`);
  return loadDealRelations((data ?? []) as DealRow[]);
}

export async function getStoredDeal(id: string): Promise<Deal | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar deal: ${error.message}`);
  if (!data) return null;

  const [deal] = await loadDealRelations([data as DealRow]);
  return deal ?? null;
}

export async function getStoredDealsByBusinessId(
  businessId: string
): Promise<Deal[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao localizar negócios: ${error.message}`);
  return loadDealRelations((data ?? []) as DealRow[]);
}

/**
 * Abre um negócio para uma empresa.
 *
 * Uma empresa pode ter vários: renovação, upsell, um segundo projeto. O que
 * distingue um do outro é o título, e por isso ele não é opcional — sem título,
 * dois cards da mesma empresa ficam indistinguíveis no Kanban.
 */
export async function createStoredDeal(input: DealInput): Promise<Deal> {
  const user = await requireUser();

  const business = await getStoredBusiness(input.businessId);
  if (!business) {
    throw new Error(`Empresa ${input.businessId} não encontrada.`);
  }

  const serviceId = input.serviceId || business.recommendedServiceId;
  const service = await getStoredService(serviceId);
  if (!service) {
    throw new Error(`Serviço ${serviceId} não existe no catálogo.`);
  }

  const supabase = await getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("deals")
    .insert({
      owner_id: user.id,
      business_id: business.id,
      title: input.title.trim() || service.name,
      service_id: service.id,
      service_name: service.name,
      contact_id: input.contactId,
      estimated_value: business.estimatedValue || service.price,
      status: "novo",
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao criar negócio: ${error.message}`);

  const row = data as DealRow;
  const { error: eventError } = await supabase.from("deal_events").insert([
    {
      deal_id: row.id,
      type: "created",
      title: "Negócio aberto",
      description: `${row.title} — ${business.name}.`,
      created_at: now,
    },
    {
      deal_id: row.id,
      type: "analysis",
      title: "Análise realizada",
      description: `Score ${business.score} — ${business.problem.toLocaleLowerCase("pt-BR")}.`,
      created_at: now,
    },
  ]);

  if (eventError) {
    await supabase.from("deals").delete().eq("id", row.id);
    throw new Error(`Falha ao criar histórico: ${eventError.message}`);
  }

  const deal = await getStoredDeal(row.id);
  if (!deal) throw new Error("O negócio criado não pôde ser carregado.");
  return deal;
}

export async function updateStoredDealStatus(
  id: string,
  status: DealStatus
): Promise<Deal> {
  const current = await getStoredDeal(id);
  if (!current) throw new Error(`Negócio ${id} não encontrado.`);
  if (current.status === status) return current;

  const supabase = await getSupabaseServerClient();
  const now = new Date().toISOString();
  const update: Record<string, string | null> = {
    status,
    updated_at: now,
  };
  if (CONTACT_STATUSES.includes(status)) update.last_contact_at = now;

  // `closed_at` é o que permite medir ciclo de venda. Reabrir um negócio limpa
  // a data, senão o relatório contaria um fechamento que não aconteceu.
  update.closed_at = CLOSED_STATUSES.includes(status) ? now : null;
  if (status !== "perdido") update.lost_reason = null;

  const { error } = await supabase.from("deals").update(update).eq("id", id);
  if (error) throw new Error(`Falha ao atualizar negócio: ${error.message}`);

  const { error: eventError } = await supabase.from("deal_events").insert({
    deal_id: id,
    type: STATUS_EVENT_TYPE[status],
    title: `Status alterado para ${getDealStatusConfig(status).label}`,
    created_at: now,
  });
  if (eventError) {
    throw new Error(`Falha ao registrar histórico: ${eventError.message}`);
  }

  // A agenda acompanha o funil: negócio encerrado não deixa lembrete solto, e
  // etapa em que a bola está com o vendedor agenda a volta sozinha.
  if (CLOSED_STATUSES.includes(status)) {
    await closeAutomaticFollowUp(id);
  } else {
    const user = await requireUser();
    await scheduleAutomaticFollowUp(id, current.businessId, status, user.id);
  }

  const deal = await getStoredDeal(id);
  if (!deal) throw new Error("O negócio atualizado não pôde ser carregado.");
  return deal;
}

export async function addStoredDealNote(
  id: string,
  content: string
): Promise<Deal> {
  const current = await getStoredDeal(id);
  if (!current) throw new Error(`Deal ${id} não encontrado.`);

  const supabase = await getSupabaseServerClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("deal_notes").insert({
    deal_id: id,
    content,
    created_at: now,
  });
  if (error) throw new Error(`Falha ao salvar observação: ${error.message}`);

  const { error: eventError } = await supabase.from("deal_events").insert({
    deal_id: id,
    type: "note",
    title: "Observação adicionada",
    created_at: now,
  });
  if (eventError) {
    throw new Error(`Falha ao registrar histórico: ${eventError.message}`);
  }

  const deal = await getStoredDeal(id);
  if (!deal) throw new Error("O negócio atualizado não pôde ser carregado.");
  return deal;
}

export async function registerStoredDealContact(id: string): Promise<Deal> {
  const current = await getStoredDeal(id);
  if (!current) throw new Error(`Deal ${id} não encontrado.`);

  const supabase = await getSupabaseServerClient();
  const now = new Date().toISOString();
  const update: Record<string, string> = {
    last_contact_at: now,
    updated_at: now,
  };
  if (current.status === "novo") update.status = "contatado";

  const { error } = await supabase.from("deals").update(update).eq("id", id);
  if (error) throw new Error(`Falha ao registrar contato: ${error.message}`);

  const { error: eventError } = await supabase.from("deal_events").insert({
    deal_id: id,
    type: "contact",
    title: "Contato registrado",
    description: "Mensagem de abordagem enviada.",
    created_at: now,
  });
  if (eventError) {
    throw new Error(`Falha ao registrar histórico: ${eventError.message}`);
  }

  const deal = await getStoredDeal(id);
  if (!deal) throw new Error("O negócio atualizado não pôde ser carregado.");
  return deal;
}
