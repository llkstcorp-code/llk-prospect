import { NextResponse } from "next/server";

import { matchesCriteria, sortBusinesses } from "@/lib/business-filters";
import { searchGeoapifyBusinesses } from "@/services/geoapify/search";
import { searchLiveBusinesses } from "@/services/places/search";
import { getBusinessesProvider } from "@/services/providers/businesses-provider";
import {
  recordBusinessSearch,
  upsertBusinesses,
} from "@/services/repositories/businesses-repository";
import type { Business, BusinessSort, SearchFilters, SearchResult } from "@/types";

interface SearchRequestBody {
  filters: SearchFilters;
  sort?: BusinessSort;
}

export const maxDuration = 180;

export async function POST(request: Request) {
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
    let matches: Business[];

    if (provider === "geoapify") {
      const live = await searchGeoapifyBusinesses(filters);
      matches = live.filter((business) => matchesCriteria(business, filters));
    } else if (provider === "google") {
      const live = await searchLiveBusinesses(filters);
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
