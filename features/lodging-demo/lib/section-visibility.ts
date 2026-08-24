/**
 * Decide quais seções a página monta.
 *
 * A regra do MVP é dura: campo ausente ou vazio = seção não renderiza. Nada de
 * placeholder, nada de "em breve". Se sobra um buraco no ritmo da página, o
 * problema é da composição, não do dado.
 */

import type { DemoSection } from "../types/design-dna";
import type { ImageRole, LodgingDemo, LodgingImage } from "../types/lodging-demo";

/** Ordem de leitura padrão quando o Design DNA não define a sua. */
const DEFAULT_SECTION_ORDER: DemoSection[] = [
  "gallery",
  "rooms",
  "amenities",
  "destination",
  "testimonials",
  "faq",
];

function hasItems<T>(list: T[] | undefined): list is T[] {
  return Array.isArray(list) && list.length > 0;
}

/** Imagens de um papel específico, na ordem em que foram declaradas. */
export function imagesByRole(
  demo: LodgingDemo,
  role: ImageRole
): LodgingImage[] {
  return demo.images.filter((image) => image.role === role);
}

/**
 * Uma imagem do papel pedido, com fallback para o hero — assim uma demo com
 * poucas fotos ainda monta as seções fotográficas sem quebrar.
 */
export function imageForRole(
  demo: LodgingDemo,
  role: ImageRole
): LodgingImage | undefined {
  return imagesByRole(demo, role)[0] ?? imagesByRole(demo, "hero")[0];
}

export function hasSection(demo: LodgingDemo, section: DemoSection): boolean {
  switch (section) {
    case "gallery":
      return imagesByRole(demo, "gallery").length > 0;
    case "rooms":
      return hasItems(demo.rooms);
    case "amenities":
      return hasItems(demo.amenities);
    case "destination":
      return hasItems(demo.attractions);
    case "testimonials":
      return hasItems(demo.testimonials);
    case "faq":
      return hasItems(demo.faq);
  }
}

/** Seções com conteúdo, já na ordem definida pelo Design DNA. */
export function visibleSections(demo: LodgingDemo): DemoSection[] {
  const order = demo.design.sectionOrder ?? DEFAULT_SECTION_ORDER;
  return order.filter((section) => hasSection(demo, section));
}
