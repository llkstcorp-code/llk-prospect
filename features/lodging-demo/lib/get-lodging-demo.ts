/**
 * Acesso às demos. Hoje o registry é um array em memória; a assinatura é
 * assíncrona de propósito para que trocar por banco depois não mexa nas rotas.
 */

import { lodgingDemos } from "../data";
import type { LodgingDemo } from "../types/lodging-demo";
import { visibleSections } from "./section-visibility";

export async function getLodgingDemo(
  slug: string
): Promise<LodgingDemo | undefined> {
  return lodgingDemos.find((demo) => demo.slug === slug);
}

/** Usado pelo `generateStaticParams` da rota. */
export async function listLodgingDemoSlugs(): Promise<string[]> {
  return lodgingDemos.map((demo) => demo.slug);
}

/**
 * Resumo de cada demo para a listagem do painel.
 *
 * O painel recebe só o que precisa para listar e compartilhar — não o objeto
 * inteiro. Assim a tela interna não fica acoplada à forma do conteúdo da
 * landing page, que vai mudar bem mais que este resumo.
 */
export interface LodgingDemoSummary {
  slug: string;
  name: string;
  city: string;
  state: string;
  status: LodgingDemo["status"];
  tagline?: string;
  /** Caminho da imagem de hero, para a miniatura da lista. */
  coverSrc?: string;
  coverAlt?: string;
  /** Quantas seções de conteúdo a página monta hoje. */
  sectionCount: number;
  /** Quando alguém conferiu o dado pela última vez (ISO `YYYY-MM-DD`). */
  reviewedAt?: string;
}

export async function listLodgingDemoSummaries(): Promise<
  LodgingDemoSummary[]
> {
  return lodgingDemos.map((demo) => {
    const cover = demo.images.find((image) => image.role === "hero");

    return {
      slug: demo.slug,
      name: demo.name,
      city: demo.location.city,
      state: demo.location.state,
      status: demo.status,
      tagline: demo.tagline,
      coverSrc: cover?.src,
      coverAlt: cover?.alt,
      sectionCount: visibleSections(demo).length,
      reviewedAt: demo.provenance?.reviewedAt,
    };
  });
}
