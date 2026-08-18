import { NextResponse } from "next/server";

import { enrichFromWebsite } from "@/services/places/enrich";
import {
  getStoredBusiness,
  updateStoredBusinessContact,
} from "@/services/repositories/businesses-repository";

export async function POST(
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
    const result = await enrichFromWebsite(business.website);
    await updateStoredBusinessContact(id, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Falha ao enriquecer a empresa ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível buscar os dados de contato." },
      { status: 502 }
    );
  }
}
