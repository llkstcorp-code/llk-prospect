import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import {
  createStoredDeal,
  listStoredDeals,
} from "@/services/repositories/deals-repository";
import type { DealInput } from "@/types";

export async function GET() {
  const denied = await guardSession();
  if (denied) return denied;

  try {
    return NextResponse.json(await listStoredDeals());
  } catch (error) {
    console.error("Falha ao listar negócios:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os negócios." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  let body: DealInput;
  try {
    body = (await request.json()) as DealInput;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }
  if (!body.businessId) {
    return NextResponse.json(
      { error: "A empresa é obrigatória." },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await createStoredDeal(body), { status: 201 });
  } catch (error) {
    console.error("Falha ao criar negócio:", error);
    return NextResponse.json(
      { error: "Não foi possível abrir um negócio para esta empresa." },
      { status: 500 }
    );
  }
}
