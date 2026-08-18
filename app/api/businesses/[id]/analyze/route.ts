import { NextResponse } from "next/server";

import { buildTemplateAnalysis } from "@/services/ai";
import { generateBusinessCopy } from "@/services/gemini";
import { getStoredBusiness } from "@/services/repositories/businesses-repository";
import type { Business } from "@/types";

interface AnalyzeRequestBody {
  business?: Business;
}

export const maxDuration = 30;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // A tela já carregou a empresa; aceitamos o corpo para não consultar a
    // fonte de novo, e caímos no armazenamento quando ele não vem.
    const body = (await request.json().catch(() => ({}))) as AnalyzeRequestBody;
    const business = body.business ?? (await getStoredBusiness(id));

    if (!business) {
      return NextResponse.json(
        { error: "Empresa não encontrada." },
        { status: 404 }
      );
    }

    const analysis = buildTemplateAnalysis(business);
    const copy = await generateBusinessCopy(business, analysis.service.name);

    return NextResponse.json(
      copy ? { ...analysis, summary: copy.summary, pitch: copy.pitch } : analysis
    );
  } catch (error) {
    console.error(`Falha ao analisar a empresa ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível gerar a análise." },
      { status: 502 }
    );
  }
}
