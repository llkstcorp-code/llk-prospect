import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import { matchesCriteria, sortBusinesses } from "@/lib/business-filters";
import { searchGeoapifyBusinesses } from "@/services/geoapify/search";
import { searchLiveBusinesses } from "@/services/places/search";
import { getBusinessesProvider } from "@/services/providers/businesses-provider";
import {
  recordBusinessSearch,
  upsertBusinesses,
} from "@/services/repositories/businesses-repository";
import { listStoredServices } from "@/services/repositories/services-repository";
import type { Business, BusinessSort, SearchFilters, SearchResult } from "@/types";

interface SearchRequestBody {
  filters: SearchFilters;
  sort?: BusinessSort;
}

export const maxDuration = 180;

export async function POST(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  let body: SearchRequestBody;
  try {
    body = (await request.json()) as SearchRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const { filters, sort = "oportunidade" } = body;
  if (!filters) {
    return NextResponse.json(
      { error: "Filtros de busca são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const provider = getBusinessesProvider();
    // O valor estimado de cada empresa sai do preço do serviço recomendado,
    // então o catálogo precisa estar em mãos antes de mapear os resultados.
    const catalog = await listStoredServices();
    let matches: Business[];

    if (provider === "geoapify") {
      const live = await searchGeoapifyBusinesses(filters, catalog);
      matches = live.filter((business) => matchesCriteria(business, filters));
    } else if (provider === "google") {
      const live = await searchLiveBusinesses(filters, catalog);
      matches = live.filter((business) => matchesCriteria(business, filters));
    } else {
      return NextResponse.json(
        { error: "Configure um provedor real de empresas antes de buscar." },
        { status: 503 }
      );
    }

    matches = [
      ...new Map(matches.map((business) => [business.id, business])).values(),
    ];

    await upsertBusinesses(matches);
    await recordBusinessSearch(filters, provider, matches);

    const result: SearchResult = {
      businesses: sortBusinesses(matches, sort),
      total: matches.length,
      provider,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Falha ao buscar empresas:", error);
    return NextResponse.json(
      { error: "Não foi possível consultar ou salvar as empresas." },
      { status: 502 }
    );
  }
}
