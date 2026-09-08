import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import {
  createStoredContact,
  listStoredContacts,
} from "@/services/repositories/contacts-repository";
import type { ContactInput } from "@/types";

/** GET /api/contatos?empresa=<id> */
export async function GET(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  const businessId = new URL(request.url).searchParams.get("empresa");
  if (!businessId) {
    return NextResponse.json(
      { error: "Informe a empresa." },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await listStoredContacts(businessId));
  } catch (error) {
    console.error("Falha ao listar contatos:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os contatos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  let input: ContactInput;
  try {
    input = (await request.json()) as ContactInput;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  if (!input.businessId || !input.name?.trim()) {
    return NextResponse.json(
      { error: "A empresa e o nome do contato são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await createStoredContact(input), { status: 201 });
  } catch (error) {
    console.error("Falha ao cadastrar contato:", error);
    return NextResponse.json(
      { error: "Não foi possível cadastrar o contato." },
      { status: 500 }
    );
  }
}
