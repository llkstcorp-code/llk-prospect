/**
 * Design DNA — a parte do dado que decide a *forma* da página.
 *
 * A ideia do gerador é que dois arquivos de dados diferentes produzam páginas
 * que não parecem o mesmo template. Por isso o DNA não é só uma paleta: cada
 * seção declara qual composição usa, e os componentes trocam de layout — não
 * só de cor — a partir daqui.
 */

/** Atmosfera geral. Afeta microtextos e tratamento fotográfico. */
export type DemoMood =
  | "rustic"
  | "intimate"
  | "nature"
  | "warm"
  | "coastal"
  | "historic";

/** Quantidade de respiro entre as seções. */
export type DemoDensity = "airy" | "balanced";

export type HeroVariant = "fullscreen" | "split" | "editorial";
export type GalleryVariant = "masonry" | "horizontal" | "editorial";
export type RoomsVariant = "full-width" | "alternating" | "grid";
export type TestimonialsVariant = "quote" | "minimal" | "photographic";
export type DestinationVariant = "editorial" | "immersive" | "split";
export type FinalCtaVariant = "photographic" | "typographic" | "minimal";

/**
 * Par tipográfico. O nome é abstrato de propósito: o dado escolhe uma
 * personalidade, e `lib/typography.ts` decide quais fontes a materializam.
 */
export type TypographyVoice = "editorial-serif" | "contemporary-sans";

/**
 * Cores em CSS puro (hex, oklch, o que for). Viram custom properties no
 * elemento raiz da demo, então não dependem dos tokens do painel.
 */
export interface DemoPalette {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  /** Texto sobre `accent`. Opcional: cai para `background` quando ausente. */
  accentForeground?: string;
  /** Superfície secundária para blocos densos. Cai para `muted`. */
  surface?: string;
  /** Cor das divisórias finas. Cai para `muted`. */
  rule?: string;
}

export interface DesignDNA {
  mood: DemoMood;
  density: DemoDensity;
  hero: HeroVariant;
  gallery: GalleryVariant;
  rooms: RoomsVariant;
  testimonials: TestimonialsVariant;
  destination: DestinationVariant;
  finalCta: FinalCtaVariant;
  typography: TypographyVoice;
  palette: DemoPalette;
  /**
   * Ordem das seções de conteúdo. Omitir usa a ordem padrão do renderer.
   * Serve para que duas demos não tenham o mesmo ritmo de leitura.
   */
  sectionOrder?: DemoSection[];
}

export type DemoSection =
  | "gallery"
  | "rooms"
  | "amenities"
  | "destination"
  | "testimonials"
  | "faq";
