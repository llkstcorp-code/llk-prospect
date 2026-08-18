import "server-only";

import { MOCK_SERVICES } from "@/data/mockServices";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ServiceOffering } from "@/types";

interface ServiceRow {
  id: string;
  name: string;
  description: string;
  price: number | string;
  price_model: ServiceOffering["priceModel"];
  type: ServiceOffering["type"];
  min_score: number;
}

function fromServiceRow(row: ServiceRow): ServiceOffering {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    priceModel: row.price_model,
    type: row.type,
    minScore: row.min_score,
  };
}

function toServiceRow(service: ServiceOffering): ServiceRow {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price,
    price_model: service.priceModel,
    type: service.type,
    min_score: service.minScore,
  };
}

export async function listStoredServices(): Promise<ServiceOffering[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`Falha ao listar serviços: ${error.message}`);
  if (data && data.length > 0) {
    return (data as ServiceRow[]).map(fromServiceRow);
  }

  const defaults = MOCK_SERVICES.map(toServiceRow);
  const { data: seeded, error: seedError } = await supabase
    .from("services")
    .upsert(defaults, { onConflict: "id" })
    .select("*")
    .order("name", { ascending: true });

  if (seedError) {
    throw new Error(`Falha ao preparar serviços: ${seedError.message}`);
  }
  return ((seeded ?? []) as ServiceRow[]).map(fromServiceRow);
}

export async function createStoredService(
  input: Omit<ServiceOffering, "id">
): Promise<ServiceOffering> {
  const service: ServiceOffering = {
    ...input,
    id: `service-${crypto.randomUUID()}`,
  };
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .insert(toServiceRow(service))
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao criar serviço: ${error.message}`);
  return fromServiceRow(data as ServiceRow);
}

export async function updateStoredService(
  id: string,
  input: Omit<ServiceOffering, "id">
): Promise<ServiceOffering> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .update(toServiceRow({ ...input, id }))
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao atualizar serviço: ${error.message}`);
  return fromServiceRow(data as ServiceRow);
}

export async function deleteStoredService(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(`Falha ao remover serviço: ${error.message}`);
}
