/**
 * Contratos do gerador de landing pages para hospedagens.
 *
 * Este domínio é propositalmente separado de `@/types` (domínio comercial do
 * LLK Prospect). Uma empresa prospectada pode, no futuro, virar a origem de
 * uma demo — mas a conversão deve morar em um adaptador, nunca em um import
 * cruzado entre os dois domínios.
 *
 * Regra geral dos campos opcionais: ausente significa "não temos esse dado".
 * Nenhum componente inventa conteúdo para preencher lacuna; a seção some.
 */

import type { DesignDNA } from "./design-dna";

/** `demo` = página de prospecção. `client` = hospedagem que já é cliente. */
export type LodgingStatus = "demo" | "client";

/**
 * Onde a imagem entra na página. O renderer escolhe por papel, então trocar a
 * ordem do array não quebra a composição.
 */
export type ImageRole = "hero" | "gallery" | "destination" | "final-cta";

export interface LodgingImage {
  /** Caminho local dentro de `public/` (ex.: `/demo/casa-duna/mare.svg`). */
  src: string;
  /** Descrição objetiva do que aparece. Nunca deixar vazio. */
  alt: string;
  width: number;
  height: number;
  /** Legenda editorial curta, usada só onde a composição pede. */
  caption?: string;
  /** Crédito/licença da imagem, exibido no rodapé quando existir. */
  credit?: string;
  /** Papel na página. Sem papel, a imagem entra apenas na galeria. */
  role?: ImageRole;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  /** Ex.: 2, 4. Ausente quando não sabemos. */
  capacity?: number;
  /** Metros quadrados. */
  size?: number;
  /** Diária a partir de, em reais. */
  priceFrom?: number;
  /** Itens concretos do quarto, não benefícios genéricos. */
  features?: string[];
  image?: LodgingImage;
}

export interface Amenity {
  /** Rótulo curto. Ex.: "Café da manhã até 10h30". */
  label: string;
  /** Detalhe factual opcional que qualifica o rótulo. */
  detail?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  /** Ex.: "Curitiba, PR" ou "hóspede em junho". */
  context?: string;
  image?: LodgingImage;
}

export interface Attraction {
  name: string;
  description: string;
  /** Ex.: "12 min de carro", "800 m a pé". */
  distance?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ReviewSummary {
  /** Média na escala da fonte (normalmente 0–5). */
  rating: number;
  count: number;
  /** De onde veio a média. Ex.: "Google". */
  source?: string;
}

/** De onde vieram os dados e quando alguém conferiu. */
export interface DataProvenance {
  sourceUrl?: string;
  /** ISO 8601 (`YYYY-MM-DD`). */
  reviewedAt: string;
  notes?: string[];
}

export interface LodgingLocation {
  city: string;
  state: string;
  address?: string;
  /** Bairro/distrito, quando ajuda a situar. */
  district?: string;
}

export interface LodgingDemo {
  slug: string;
  status: LodgingStatus;
  name: string;
  location: LodgingLocation;
  /** Frase curta do hero. Específica da casa, não do turismo em geral. */
  tagline?: string;
  /** Parágrafo de abertura. */
  description?: string;
  /**
   * Frase do bloco final, antes do CTA. Fica no dado (e não no componente)
   * porque é conteúdo da casa — o gerador não inventa fechamento.
   */
  closingHeadline?: string;
  /** Destino de todos os CTAs de reserva. Sempre absoluto e https. */
  bookingUrl: string;
  /** Só dígitos com DDI/DDD. Ex.: "5535999990000". */
  whatsapp?: string;
  /** Handle sem `@`. */
  instagram?: string;
  images: LodgingImage[];
  rooms?: Room[];
  amenities?: Amenity[];
  testimonials?: Testimonial[];
  attractions?: Attraction[];
  faq?: FaqItem[];
  reviewSummary?: ReviewSummary;
  design: DesignDNA;
  provenance?: DataProvenance;
}
