/**
 * Acesso às demos. Hoje o registry é um array em memória; a assinatura é
 * assíncrona de propósito para que trocar por banco depois não mexa nas rotas.
 */

import { lodgingDemos } from "../data";
import type { LodgingDemo } from "../types/lodging-demo";

export async function getLodgingDemo(
  slug: string
): Promise<LodgingDemo | undefined> {
  return lodgingDemos.find((demo) => demo.slug === slug);
}

/** Usado pelo `generateStaticParams` da rota. */
export async function listLodgingDemoSlugs(): Promise<string[]> {
  return lodgingDemos.map((demo) => demo.slug);
}
