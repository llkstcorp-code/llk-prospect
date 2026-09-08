import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import {
  deleteStoredService,
  updateStoredService,
} from "@/services/repositories/services-repository";
import type { ServiceOffering } from "@/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const denied = await guardSession();
  if (denied) return denied;

  try {
    const input = (await request.json()) as Omit<ServiceOffering, "id">;
    return NextResponse.json(await updateStoredService(id, input));
  } catch (error) {
    console.error(`Falha ao atualizar serviço ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o serviço." },
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
    await deleteStoredService(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Falha ao remover serviço ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível remover o serviço." },
      { status: 500 }
    );
  }
}
