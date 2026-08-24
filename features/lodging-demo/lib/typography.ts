import { Archivo, Fraunces, Inter_Tight, Karla } from "next/font/google";

import type { TypographyVoice } from "../types/design-dna";

/**
 * Cada voz tipográfica é um par display + texto, aplicado no elemento raiz da
 * demo.
 *
 * As duas vozes vivem no mesmo módulo porque as duas demos compartilham a rota
 * `/demo/[slug]`: o grafo de módulos é o mesmo, então separar os arquivos não
 * evitaria o download da voz não usada. Se isso virar um problema de
 * performance, o caminho é dar rota própria a cada identidade — não quebrar
 * este arquivo em dois.
 */

const fraunces = Fraunces({
  variable: "--demo-font-display",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const karla = Karla({
  variable: "--demo-font-text",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--demo-font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--demo-font-text",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const VOICES: Record<TypographyVoice, string> = {
  "editorial-serif": `${fraunces.variable} ${karla.variable}`,
  "contemporary-sans": `${archivo.variable} ${interTight.variable}`,
};

export function typographyClassName(voice: TypographyVoice): string {
  return VOICES[voice];
}
