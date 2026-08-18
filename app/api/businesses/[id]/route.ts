import { NextResponse } from "next/server";

import { getStoredBusiness } from "@/services/repositories/businesses-repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const business = await getStoredBusiness(id);
    if (!business) {
      return NextResponse.json(
        { error: "Empresa não encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json(business);
  } catch (error) {
    console.error(`Falha ao carregar a empresa ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível carregar a empresa." },
      { status: 500 }
    );
  }
}
