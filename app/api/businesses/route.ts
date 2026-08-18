import { NextResponse } from "next/server";

import { sortBusinesses } from "@/lib/business-filters";
import { OPPORTUNITY_MIN_SCORE } from "@/lib/score";
import { listStoredBusinesses } from "@/services/repositories/businesses-repository";
import type { CategoryId } from "@/types";

/** GET /api/businesses — lista somente empresas já encontradas e persistidas. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const minScore = Number(params.get("minScore") ?? OPPORTUNITY_MIN_SCORE);
  const category = (params.get("category") ?? "todas") as
    | CategoryId
    | "todas";

  try {
    const businesses = await listStoredBusinesses({ minScore, category });
    return NextResponse.json(sortBusinesses(businesses, "oportunidade"));
  } catch (error) {
    console.error("Falha ao listar empresas:", error);
    return NextResponse.json(
      { error: "Não foi possível listar as empresas." },
      { status: 500 }
    );
  }
}
