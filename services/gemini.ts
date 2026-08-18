import type { Business } from "@/types";

/**
 * Geração de texto da prospecção pela Gemini API.
 *
 * O modelo escreve apenas o resumo da oportunidade e a mensagem de abordagem.
 * Score, serviço recomendado e indicadores continuam sendo calculados a partir
 * dos dados — um modelo de linguagem não tem como saber se a empresa tem site.
 */

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-3.6-flash";
/** Sobrecarga do modelo e temporaria: uma segunda tentativa costuma passar. */
const RETRY_STATUSES = new Set([429, 503]);
const RETRY_DELAY_MS = 1_200;
// Duas tentativas mais a espera precisam caber no maxDuration da rota (60s).
// 12s derrubava a primeira chamada depois de cold start em producao.
const REQUEST_TIMEOUT_MS = 20_000;

const SYSTEM_INSTRUCTION = [
  "Você escreve para a LLK, agência de criação de sites do interior de Minas ",
  "Gerais. Escreva em português do Brasil, de forma direta e concreta, sem ",
  "jargão de marketing, sem superlativos e sem promessas de resultado. ",
  "Use somente os dados fornecidos: nunca invente telefone, endereço, tempo ",
  "de mercado, número de clientes, avaliações ou qualquer fato que não esteja ",
  "na lista. Quando um dado não for fornecido, não o mencione. ",
  "Se a empresa for uma rede ou franquia, nunca afirme que ela não tem site: ",
  "redes têm site corporativo, e a conversa é sobre material da unidade local.",
].join("");

export interface GeneratedCopy {
  summary: string;
  pitch: string;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

function buildPrompt(business: Business, serviceName: string): string {
  // `problem` e o unico lugar onde a deteccao de rede sobrevive ate aqui.
  const isChain = business.problem.startsWith("Rede");
  const lines = [
    `Empresa: ${business.name}`,
    `Categoria: ${business.category}`,
    `Cidade: ${business.city}, ${business.state}`,
    `Site conhecido: ${business.website ? business.website : "não"}`,
    `Lacuna identificada: ${business.problem}`,
    `Serviço recomendado: ${serviceName}`,
    `Rede ou franquia: ${isChain ? "sim" : "não"}`,
  ];

  if (business.ratingAvailable !== false) {
    lines.push(
      `Avaliação no Google: ${business.rating} com ${business.reviews} avaliações`
    );
  }

  return [
    ...lines,
    "",
    "Escreva dois textos:",
    "1. summary: o resumo da oportunidade em 2 frases, para o vendedor ler antes de ligar.",
    "2. pitch: a mensagem de primeiro contato por WhatsApp em 3 frases, tratando o destinatário por você, sem citar preço.",
  ].join("\n");
}

function callGemini(apiKey: string, body: string): Promise<Response> {
  return fetch(`${GEMINI_ENDPOINT}/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body,
  });
}

/**
 * Devolve `null` quando a Gemini não está configurada ou falha: quem chama
 * cai no texto de template, que sempre existe.
 */
export async function generateBusinessCopy(
  business: Business,
  serviceName: string
): Promise<GeneratedCopy | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ parts: [{ text: buildPrompt(business, serviceName) }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          summary: { type: "STRING" },
          pitch: { type: "STRING" },
        },
        required: ["summary", "pitch"],
      },
    },
  });

  try {
    let response = await callGemini(apiKey, body);

    if (RETRY_STATUSES.has(response.status)) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      response = await callGemini(apiKey, body);
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `Gemini respondeu ${response.status}: ${detail.slice(0, 300)}`
      );
      return null;
    }

    const payload = (await response.json()) as GeminiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as Partial<GeneratedCopy>;
    if (!parsed.summary?.trim() || !parsed.pitch?.trim()) return null;

    return { summary: parsed.summary.trim(), pitch: parsed.pitch.trim() };
  } catch (error) {
    console.error("Falha ao gerar texto na Gemini:", error);
    return null;
  }
}
