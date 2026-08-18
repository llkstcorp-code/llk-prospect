import type { ServiceOffering } from "@/types";

/**
 * Catálogo de serviços da LLK usado nas recomendações e no CRM.
 *
 * O array é mutado em memória por `services/settings.ts` (cadastro de serviços)
 * para que todas as telas enxerguem o mesmo catálogo enquanto não há banco.
 */
export const MOCK_SERVICES: ServiceOffering[] = [
  {
    id: "site-profissional",
    name: "Site Profissional",
    description:
      "Site institucional completo, responsivo e otimizado para conversão, com formulário de contato e integração com WhatsApp.",
    price: 2000,
    priceModel: "unico",
    type: "site",
    minScore: 70,
  },
  {
    id: "seo",
    name: "SEO",
    description:
      "Otimização contínua para busca local, ficha do Google e produção de conteúdo para ganhar posições na região.",
    price: 600,
    priceModel: "mensal",
    type: "seo",
    minScore: 60,
  },
  {
    id: "landing-page",
    name: "Landing Page",
    description:
      "Página única focada em campanha, com copy orientada a conversão e medição de resultados.",
    price: 800,
    priceModel: "unico",
    type: "landing",
    minScore: 40,
  },
  {
    id: "manutencao",
    name: "Manutenção",
    description:
      "Atualizações, backups, monitoramento e pequenos ajustes mensais no site do cliente.",
    price: 300,
    priceModel: "mensal",
    type: "manutencao",
    minScore: 30,
  },
  {
    id: "sistema-sob-medida",
    name: "Sistema sob medida",
    description:
      "Sistema web para agendamentos, reservas ou gestão interna, desenhado para a operação do cliente.",
    price: 6500,
    priceModel: "unico",
    type: "sistema",
    minScore: 80,
  },
];

export function getServiceById(id: string): ServiceOffering | undefined {
  return MOCK_SERVICES.find((service) => service.id === id);
}

export function getServiceName(id: string): string {
  return getServiceById(id)?.name ?? "Serviço não definido";
}

