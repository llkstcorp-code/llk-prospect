import "server-only";

import { getServiceById } from "@/data/mockServices";
import { getLeadStatusConfig } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Business,
  Lead,
  LeadNote,
  LeadStatus,
  ServiceOffering,
  TimelineEvent,
  TimelineEventType,
} from "@/types";
import { getStoredBusiness } from "./businesses-repository";

interface LeadRow {
  id: string;
  business_id: string;
  service_id: string | null;
  service_name: string;
  estimated_value: number | string;
  status: LeadStatus;
  created_at: string;
  last_contact_at: string | null;
}

interface EventRow {
  id: string;
  lead_id: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  created_at: string;
}

interface NoteRow {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
}

const STATUS_EVENT_TYPE: Record<LeadStatus, TimelineEventType> = {
  novo: "created",
  contatado: "contact",
  respondeu: "reply",
  reuniao: "meeting",
  proposta: "proposal",
  fechado: "won",
  perdido: "lost",
};

const CONTACT_STATUSES: LeadStatus[] = [
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

function mapNote(row: NoteRow): LeadNote {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapLead(
  row: LeadRow,
  business: Business,
  events: EventRow[],
  notes: NoteRow[]
): Lead {
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: business.name,
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
    timeline: events.map(mapEvent),
    notes: notes.map(mapNote),
  };
}

async function loadLeadRelations(rows: LeadRow[]): Promise<Lead[]> {
  if (rows.length === 0) return [];

  const supabase = getSupabaseServerClient();
  const businessIds = [...new Set(rows.map((row) => row.business_id))];
  const leadIds = rows.map((row) => row.id);

  const [businessesResult, eventsResult, notesResult] = await Promise.all([
    supabase.from("businesses").select("*").in("id", businessIds),
    supabase
      .from("lead_events")
      .select("*")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("lead_notes")
      .select("*")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false }),
  ]);

  const relationError =
    businessesResult.error ?? eventsResult.error ?? notesResult.error;
  if (relationError) {
    throw new Error(`Falha ao carregar dados dos leads: ${relationError.message}`);
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

  return rows.flatMap((row) => {
    const business = businesses.get(row.business_id);
    if (!business) return [];
    return [
      mapLead(
        row,
        business,
        events.filter((event) => event.lead_id === row.id),
        notes.filter((note) => note.lead_id === row.id)
      ),
    ];
  });
}

async function ensureService(service: ServiceOffering): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("services").upsert(
    {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      price_model: service.priceModel,
      type: service.type,
      min_score: service.minScore,
    },
    { onConflict: "id" }
  );

  if (error) throw new Error(`Falha ao preparar serviço: ${error.message}`);
}

export async function listStoredLeads(): Promise<Lead[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao listar leads: ${error.message}`);
  return loadLeadRelations((data ?? []) as LeadRow[]);
}

export async function getStoredLead(id: string): Promise<Lead | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar lead: ${error.message}`);
  if (!data) return null;

  const [lead] = await loadLeadRelations([data as LeadRow]);
  return lead ?? null;
}

export async function getStoredLeadByBusinessId(
  businessId: string
): Promise<Lead | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw new Error(`Falha ao localizar lead: ${error.message}`);
  if (!data) return null;

  const [lead] = await loadLeadRelations([data as LeadRow]);
  return lead ?? null;
}

export async function createStoredLead(businessId: string): Promise<Lead> {
  const existing = await getStoredLeadByBusinessId(businessId);
  if (existing) return existing;

  const business = await getStoredBusiness(businessId);
  if (!business) throw new Error(`Empresa ${businessId} não encontrada.`);

  const service = getServiceById(business.recommendedServiceId);
  if (!service) throw new Error("Serviço recomendado não encontrado.");
  await ensureService(service);

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      business_id: business.id,
      service_id: service.id,
      service_name: service.name,
      estimated_value: business.estimatedValue || service.price,
      status: "novo",
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const duplicate = await getStoredLeadByBusinessId(businessId);
      if (duplicate) return duplicate;
    }
    throw new Error(`Falha ao criar lead: ${error.message}`);
  }

  const row = data as LeadRow;
  const { error: eventError } = await supabase.from("lead_events").insert([
    {
      lead_id: row.id,
      type: "created",
      title: "Lead criado",
      description: `${business.name} foi adicionada à sua carteira.`,
      created_at: now,
    },
    {
      lead_id: row.id,
      type: "analysis",
      title: "Análise realizada",
      description: `Score ${business.score} — ${business.problem.toLocaleLowerCase("pt-BR")}.`,
      created_at: now,
    },
  ]);

  if (eventError) {
    await supabase.from("leads").delete().eq("id", row.id);
    throw new Error(`Falha ao criar histórico: ${eventError.message}`);
  }

  const lead = await getStoredLead(row.id);
  if (!lead) throw new Error("O lead criado não pôde ser carregado.");
  return lead;
}

export async function updateStoredLeadStatus(
  id: string,
  status: LeadStatus
): Promise<Lead> {
  const current = await getStoredLead(id);
  if (!current) throw new Error(`Lead ${id} não encontrado.`);
  if (current.status === status) return current;

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const update: Record<string, string> = {
    status,
    updated_at: now,
  };
  if (CONTACT_STATUSES.includes(status)) update.last_contact_at = now;

  const { error } = await supabase.from("leads").update(update).eq("id", id);
  if (error) throw new Error(`Falha ao atualizar lead: ${error.message}`);

  const { error: eventError } = await supabase.from("lead_events").insert({
    lead_id: id,
    type: STATUS_EVENT_TYPE[status],
    title: `Status alterado para ${getLeadStatusConfig(status).label}`,
    created_at: now,
  });
  if (eventError) {
    throw new Error(`Falha ao registrar histórico: ${eventError.message}`);
  }

  const lead = await getStoredLead(id);
  if (!lead) throw new Error("O lead atualizado não pôde ser carregado.");
  return lead;
}

export async function addStoredLeadNote(
  id: string,
  content: string
): Promise<Lead> {
  const current = await getStoredLead(id);
  if (!current) throw new Error(`Lead ${id} não encontrado.`);

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("lead_notes").insert({
    lead_id: id,
    content,
    created_at: now,
  });
  if (error) throw new Error(`Falha ao salvar observação: ${error.message}`);

  const { error: eventError } = await supabase.from("lead_events").insert({
    lead_id: id,
    type: "note",
    title: "Observação adicionada",
    created_at: now,
  });
  if (eventError) {
    throw new Error(`Falha ao registrar histórico: ${eventError.message}`);
  }

  const lead = await getStoredLead(id);
  if (!lead) throw new Error("O lead atualizado não pôde ser carregado.");
  return lead;
}

export async function registerStoredLeadContact(id: string): Promise<Lead> {
  const current = await getStoredLead(id);
  if (!current) throw new Error(`Lead ${id} não encontrado.`);

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const update: Record<string, string> = {
    last_contact_at: now,
    updated_at: now,
  };
  if (current.status === "novo") update.status = "contatado";

  const { error } = await supabase.from("leads").update(update).eq("id", id);
  if (error) throw new Error(`Falha ao registrar contato: ${error.message}`);

  const { error: eventError } = await supabase.from("lead_events").insert({
    lead_id: id,
    type: "contact",
    title: "Contato registrado",
    description: "Mensagem de abordagem enviada.",
    created_at: now,
  });
  if (eventError) {
    throw new Error(`Falha ao registrar histórico: ${eventError.message}`);
  }

  const lead = await getStoredLead(id);
  if (!lead) throw new Error("O lead atualizado não pôde ser carregado.");
  return lead;
}
