import { getServiceById, MOCK_SERVICES } from "@/data/mockServices";
import { formatRating } from "@/lib/format";
import type {
  AnalysisIndicator,
  Business,
  BusinessAnalysis,
  CategoryId,
} from "@/types";
import { delay } from "./api";

/**
 * Camada de inteligência da prospecção.
 *
 * Hoje os textos são gerados por template a partir dos dados da empresa. Quando
 * a Gemini API for conectada, apenas o corpo destas funções muda.
 */

interface CategoryContext {
  /** O que o cliente final ganha com o serviço. */
  benefit: string;
  /** Complemento usado no resumo da análise. */
  opportunity: string;
}

const DEFAULT_CONTEXT: CategoryContext = {
  benefit: "o contato direto com os clientes",
  opportunity: "facilitar o contato e gerar mais pedidos de orçamento",
};

const CATEGORY_CONTEXT: Partial<Record<CategoryId, CategoryContext>> = {
  pousada: {
    benefit: "o contato e as reservas dos clientes",
    opportunity: "facilitar reservas e contatos diretos",
  },
  hotel: {
    benefit: "o contato e as reservas dos hóspedes",
    opportunity: "facilitar reservas e contatos diretos",
  },
  restaurante: {
    benefit: "os pedidos e as reservas de mesa",
    opportunity: "receber pedidos e reservas sem depender de intermediários",
  },
  pizzaria: {
    benefit: "os pedidos feitos direto pelo cliente",
    opportunity: "receber pedidos sem depender de aplicativos de entrega",
  },
  clinica: {
    benefit: "os agendamentos dos pacientes",
    opportunity: "organizar agendamentos e transmitir mais credibilidade",
  },
  dentista: {
    benefit: "os agendamentos dos pacientes",
    opportunity: "organizar agendamentos e transmitir mais credibilidade",
  },
  academia: {
    benefit: "as matrículas e a divulgação dos planos",
    opportunity: "apresentar planos e captar matrículas pela internet",
  },
  imobiliaria: {
    benefit: "a busca de imóveis pelos interessados",
    opportunity: "expor a carteira de imóveis e captar interessados",
  },
  loja: {
    benefit: "a apresentação dos produtos",
    opportunity: "apresentar o catálogo e receber pedidos pela internet",
  },
  oficina: {
    benefit: "o agendamento de serviços",
    opportunity: "receber pedidos de orçamento e agendar serviços",
  },
  construcao: {
    benefit: "a apresentação das obras e lançamentos",
    opportunity: "apresentar o portfólio e captar novos clientes",
  },
};

function getContext(category: CategoryId): CategoryContext {
  return CATEGORY_CONTEXT[category] ?? DEFAULT_CONTEXT;
}

function getReputationWord(business: Business): string {
  if (business.rating >= 4.7 && business.reviews >= 150) return "excelente";
  if (business.rating >= 4.3) return "boa";
  return "regular";
}

function hasPublicRating(business: Business): boolean {
  return business.ratingAvailable !== false;
}

function buildIndicators(business: Business): AnalysisIndicator[] {
  const googlePresence = (): AnalysisIndicator => {
    if (!hasPublicRating(business)) {
      return {
        label: "Dados cadastrais",
        value: business.phone !== "Telefone não informado" ? "Bom" : "Parcial",
        level: business.phone !== "Telefone não informado" ? "medio" : "baixo",
      };
    }
    if (business.rating >= 4.7 && business.reviews >= 150) {
      return { label: "Presença no Google", value: "Excelente", level: "alto" };
    }
    if (business.rating >= 4.3 && business.reviews >= 80) {
      return { label: "Presença no Google", value: "Boa", level: "medio" };
    }
    return { label: "Presença no Google", value: "Regular", level: "baixo" };
  };

  const websiteNeed = (): AnalysisIndicator => {
    if (!business.website && business.reviews >= 150) {
      return { label: "Necessidade de site", value: "Muito alta", level: "alto" };
    }
    if (!business.website) {
      return { label: "Necessidade de site", value: "Alta", level: "alto" };
    }
    if (business.score >= 60) {
      return { label: "Necessidade de site", value: "Média", level: "medio" };
    }
    return { label: "Necessidade de site", value: "Baixa", level: "baixo" };
  };

  const commercialPotential = (): AnalysisIndicator => {
    if (business.score >= 85) {
      return { label: "Potencial comercial", value: "Muito alto", level: "alto" };
    }
    if (business.score >= 70) {
      return { label: "Potencial comercial", value: "Alto", level: "alto" };
    }
    if (business.score >= 40) {
      return { label: "Potencial comercial", value: "Médio", level: "medio" };
    }
    return { label: "Potencial comercial", value: "Baixo", level: "baixo" };
  };

  return [googlePresence(), websiteNeed(), commercialPotential()];
}

function buildReasons(business: Business): string[] {
  const reasons: string[] = [];

  reasons.push(business.website ? business.problem : "Não possui site");

  if (!hasPublicRating(business)) {
    reasons.push("Oportunidade identificada por presença digital");
  } else if (business.rating >= 4.5) {
    reasons.push("Boa reputação no Google");
  } else {
    reasons.push("Reputação com espaço para melhorar");
  }

  if (business.reviews >= 150) {
    reasons.push("Empresa estabelecida");
  } else {
    reasons.push("Negócio em crescimento na região");
  }

  reasons.push(
    business.instagram
      ? "Possui Instagram ativo"
      : "Sem presença em redes sociais"
  );

  if (business.score >= 85) {
    reasons.push("Alto potencial de conversão");
  } else if (business.score >= 70) {
    reasons.push("Bom potencial de conversão");
  }

  return reasons;
}

function buildSummary(business: Business): string {
  const gap = business.website
    ? business.problem.toLocaleLowerCase("pt-BR")
    : "não possui um site próprio";

  if (!hasPublicRating(business)) {
    return [
      `A ${business.name} foi identificada na região de ${business.city} e ${gap}. `,
      `Os dados públicos disponíveis indicam uma oportunidade para fortalecer `,
      `a presença digital e ${getContext(business.category).opportunity}. `,
      `A reputação por avaliações não está disponível nesta fonte.`,
    ].join("");
  }

  return [
    `A empresa possui ${getReputationWord(business)} reputação no Google, com `,
    `${business.reviews} avaliações e nota ${formatRating(business.rating)}, `,
    `mas ${gap}. Isso representa uma oportunidade para criar uma presença `,
    `digital profissional e ${getContext(business.category).opportunity}.`,
  ].join("");
}

/** Mensagem de abordagem sugerida para o primeiro contato. */
export function buildPitch(business: Business, serviceName: string): string {
  const context = getContext(business.category);
  const gap = business.website
    ? business.problem.toLocaleLowerCase("pt-BR")
    : "ainda não possuem um site próprio";

  const introduction = hasPublicRating(business)
    ? `Encontrei a ${business.name} no Google e percebi que vocês possuem uma excelente avaliação e bastante procura, mas ${gap}. `
    : `Encontrei a ${business.name} pesquisando empresas da região e percebi que ${gap}. `;

  return [
    `Olá! Tudo bem? ${introduction}`,
    `Nós trabalhamos com ${serviceName.toLocaleLowerCase("pt-BR")} para `,
    `empresas da região e acredito que poderíamos criar algo que facilitasse `,
    `bastante ${context.benefit}.`,
  ].join("");
}

/**
 * POST /api/businesses/:id/analyze
 *
 * Recebe a empresa já carregada para não consultar o Google duas vezes na mesma
 * tela — a análise é derivada dos dados, não de uma nova busca.
 */
export async function analyzeBusiness(
  business: Business
): Promise<BusinessAnalysis> {
  await delay(600);

  const service =
    getServiceById(business.recommendedServiceId) ?? MOCK_SERVICES[0];

  return {
    businessId: business.id,
    summary: buildSummary(business),
    indicators: buildIndicators(business),
    service,
    reasons: buildReasons(business),
    estimatedValue: service.price,
    pitch: buildPitch(business, service.name),
  };
}
