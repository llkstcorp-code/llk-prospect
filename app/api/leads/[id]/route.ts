import { NextResponse } from "next/server";

import {
  addStoredLeadNote,
  getStoredLead,
  registerStoredLeadContact,
  updateStoredLeadStatus,
} from "@/services/repositories/leads-repository";
import type { LeadStatus } from "@/types";

const VALID_STATUSES: LeadStatus[] = [
  "novo",
  "contatado",
  "respondeu",
  "reuniao",
  "proposta",
  "fechado",
  "perdido",
];

interface UpdateLeadBody {
  status?: LeadStatus;
  note?: string;
  registerContact?: boolean;
}

function isLeadStatus(value: unknown): value is LeadStatus {
  return VALID_STATUSES.includes(value as LeadStatus);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const lead = await getStoredLead(id);
    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(lead);
  } catch (error) {
    console.error(`Falha ao carregar lead ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível carregar o lead." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let body: UpdateLeadBody;
  try {
    body = (await request.json()) as UpdateLeadBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  try {
    if (body.registerContact) {
      return NextResponse.json(await registerStoredLeadContact(id));
    }
    if (typeof body.note === "string" && body.note.trim()) {
      return NextResponse.json(await addStoredLeadNote(id, body.note.trim()));
    }
    if (isLeadStatus(body.status)) {
      return NextResponse.json(await updateStoredLeadStatus(id, body.status));
    }
    return NextResponse.json(
      { error: "Nenhuma alteração válida foi informada." },
      { status: 400 }
    );
  } catch (error) {
    console.error(`Falha ao atualizar lead ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o lead." },
      { status: 500 }
    );
  }
}
