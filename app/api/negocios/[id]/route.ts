import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import {
  addStoredDealNote,
  getStoredDeal,
  registerStoredDealContact,
  updateStoredDealStatus,
} from "@/services/repositories/deals-repository";
import type { DealStatus } from "@/types";

const VALID_STATUSES: DealStatus[] = [
  "novo",
  "contatado",
  "respondeu",
  "reuniao",
  "proposta",
  "fechado",
  "perdido",
];

interface UpdateDealBody {
  status?: DealStatus;
  note?: string;
  registerContact?: boolean;
}

function isDealStatus(value: unknown): value is DealStatus {
  return VALID_STATUSES.includes(value as DealStatus);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const denied = await guardSession();
  if (denied) return denied;

  try {
    const deal = await getStoredDeal(id);
    if (!deal) {
      return NextResponse.json(
        { error: "Deal não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(deal);
  } catch (error) {
    console.error(`Falha ao carregar deal ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível carregar o negócio." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const denied = await guardSession();
  if (denied) return denied;

  let body: UpdateDealBody;
  try {
    body = (await request.json()) as UpdateDealBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  try {
    if (body.registerContact) {
      return NextResponse.json(await registerStoredDealContact(id));
    }
    if (typeof body.note === "string" && body.note.trim()) {
      return NextResponse.json(await addStoredDealNote(id, body.note.trim()));
    }
    if (isDealStatus(body.status)) {
      return NextResponse.json(await updateStoredDealStatus(id, body.status));
    }
    return NextResponse.json(
      { error: "Nenhuma alteração válida foi informada." },
      { status: 400 }
    );
  } catch (error) {
    console.error(`Falha ao atualizar deal ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o negócio." },
      { status: 500 }
    );
  }
}
