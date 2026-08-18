import { getServiceById } from "@/data/mockServices";
import type {
  Business,
  Lead,
  LeadNote,
  LeadStatus,
  TimelineEvent,
} from "@/types";

let sequence = 0;

/** Gera um id local previsível enquanto o banco não define os ids reais. */
export function createId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
}

export interface LeadSeed {
  status?: LeadStatus;
  createdAt?: string;
  lastContactAt?: string | null;
  timeline?: TimelineEvent[];
  notes?: LeadNote[];
}

/** Converte uma empresa analisada em um lead do CRM. */
export function createLeadFromBusiness(
  business: Business,
  seed: LeadSeed = {}
): Lead {
  const service = getServiceById(business.recommendedServiceId);
  const createdAt = seed.createdAt ?? new Date().toISOString();

  return {
    id: `lead-${business.id}`,
    businessId: business.id,
    businessName: business.name,
    category: business.category,
    city: business.city,
    state: business.state,
    score: business.score,
    problem: business.problem,
    serviceId: business.recommendedServiceId,
    serviceName: service?.name ?? "Serviço não definido",
    estimatedValue: service?.price ?? business.estimatedValue,
    status: seed.status ?? "novo",
    createdAt,
    lastContactAt: seed.lastContactAt ?? null,
    timeline: seed.timeline ?? [
      {
        id: createId("event"),
        type: "created",
        title: "Lead criado",
        description: `${business.name} foi adicionada à sua carteira.`,
        date: createdAt,
      },
    ],
    notes: seed.notes ?? [],
  };
}
