import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import { sortBusinesses } from "@/lib/business-filters";
import {
  toManualBusiness,
  validateManualBusiness,
} from "@/lib/manual-business";
import { OPPORTUNITY_MIN_SCORE } from "@/lib/score";
import {
  insertManualBusiness,
  listStoredBusinesses,
} from "@/services/repositories/businesses-repository";
import { listStoredServices } from "@/services/repositories/services-repository";
import type { CategoryId, ManualBusinessInput } from "@/types";

/** GET /api/businesses — lista somente empresas já encontradas e persistidas. */
export async function GET(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

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

/** POST /api/businesses — cadastra uma empresa digitada por uma pessoa. */
export async function POST(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  let input: ManualBusinessInput;
  try {
    input = (await request.json()) as ManualBusinessInput;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const errors = validateManualBusiness(input);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  try {
    const catalog = await listStoredServices();
    const business = toManualBusiness(input, catalog, {
      id: `manual-${crypto.randomUUID()}`,
      foundAt: new Date().toISOString().slice(0, 10),
    });
    return NextResponse.json(await insertManualBusiness(business), {
      status: 201,
    });
  } catch (error) {
    console.error("Falha ao cadastrar empresa manual:", error);
    return NextResponse.json(
      { error: "Não foi possível cadastrar a empresa." },
      { status: 500 }
    );
  }
}
