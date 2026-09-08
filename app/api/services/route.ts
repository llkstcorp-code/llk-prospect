import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import {
  createStoredService,
  listStoredServices,
} from "@/services/repositories/services-repository";
import type { ServiceOffering } from "@/types";

export async function GET() {
  const denied = await guardSession();
  if (denied) return denied;

  try {
    return NextResponse.json(await listStoredServices());
  } catch (error) {
    console.error("Falha ao listar serviços:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os serviços." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  try {
    const input = (await request.json()) as Omit<ServiceOffering, "id">;
    return NextResponse.json(await createStoredService(input), { status: 201 });
  } catch (error) {
    console.error("Falha ao criar serviço:", error);
    return NextResponse.json(
      { error: "Não foi possível cadastrar o serviço." },
      { status: 500 }
    );
  }
}
