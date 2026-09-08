import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import {
  deleteStoredContact,
  updateStoredContact,
} from "@/services/repositories/contacts-repository";
import type { ContactInput } from "@/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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

  if (!input.name?.trim()) {
    return NextResponse.json(
      { error: "O nome do contato é obrigatório." },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await updateStoredContact(id, input));
  } catch (error) {
    console.error(`Falha ao atualizar contato ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o contato." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const denied = await guardSession();
  if (denied) return denied;

  try {
    await deleteStoredContact(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Falha ao remover contato ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível remover o contato." },
      { status: 500 }
    );
  }
}
