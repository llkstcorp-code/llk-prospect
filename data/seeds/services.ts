import type { ServiceOffering } from "@/types";

/**
 * Catálogo inicial de serviços da LLK.
 *
 * É semente, não fonte: só é lido quando a tabela `services` está vazia, para
 * que um projeto novo do Supabase já abra com o catálogo padrão. Depois disso
 * quem manda é o banco — nada em `app/`, `services/` ou `lib/` deve importar
 * este arquivo fora do caminho de seed.
 */
export const DEFAULT_SERVICES: ServiceOffering[] = [
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

/**
 * Serviço usado quando a empresa aponta para um id que não existe mais no
 * catálogo — um serviço removido nas configurações, por exemplo.
 */
export const FALLBACK_SERVICE_ID = "site-profissional";
