import { NextResponse } from "next/server";

import {
  createStoredLead,
  listStoredLeads,
} from "@/services/repositories/leads-repository";

interface CreateLeadBody {
  businessId?: string;
}

export async function GET() {
  try {
    return NextResponse.json(await listStoredLeads());
  } catch (error) {
    console.error("Falha ao listar leads:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar seus leads." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: CreateLeadBody;
  try {
    body = (await request.json()) as CreateLeadBody;
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
    return NextResponse.json(await createStoredLead(body.businessId), {
      status: 201,
    });
  } catch (error) {
    console.error("Falha ao criar lead:", error);
    return NextResponse.json(
      { error: "Não foi possível adicionar a empresa aos leads." },
      { status: 500 }
    );
  }
}
