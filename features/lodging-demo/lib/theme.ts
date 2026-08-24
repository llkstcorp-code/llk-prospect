import type { CSSProperties } from "react";

import type { DesignDNA } from "../types/design-dna";

/**
 * Converte o Design DNA em custom properties CSS.
 *
 * As demos não podem herdar os tokens do painel (que ainda respondem ao tema
 * claro/escuro do CRM). Tudo o que a landing page pinta vem daqui, aplicado no
 * elemento raiz da página.
 */
export function demoThemeStyle(design: DesignDNA): CSSProperties {
  const { palette, density } = design;

  return {
    "--demo-bg": palette.background,
    "--demo-fg": palette.foreground,
    "--demo-accent": palette.accent,
    "--demo-accent-fg": palette.accentForeground ?? palette.background,
    "--demo-muted": palette.muted,
    "--demo-surface": palette.surface ?? palette.muted,
    "--demo-rule": palette.rule ?? palette.muted,
    // Ritmo vertical: "airy" respira mais entre as seções.
    "--demo-gap": density === "airy" ? "clamp(5rem, 12vw, 11rem)" : "clamp(3.5rem, 8vw, 7rem)",
    "--demo-gap-tight": density === "airy" ? "clamp(2rem, 5vw, 4rem)" : "clamp(1.5rem, 3.5vw, 2.75rem)",
  } as CSSProperties;
}
