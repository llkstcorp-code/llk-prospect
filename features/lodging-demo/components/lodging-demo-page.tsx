import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { visibleSections } from "../lib/section-visibility";
import { demoThemeStyle } from "../lib/theme";
import { typographyClassName } from "../lib/typography";
import type { DemoSection } from "../types/design-dna";
import type { LodgingDemo } from "../types/lodging-demo";
import { Amenities } from "./amenities";
import { DemoFooter } from "./demo-footer";
import { DemoNotice } from "./demo-notice";
import { Destination } from "./destination";
import { Faq } from "./faq";
import { FinalCta } from "./final-cta";
import { Gallery } from "./gallery";
import { Hero } from "./hero";
import { Intro } from "./intro";
import { Rooms } from "./rooms";
import { Testimonials } from "./testimonials";

const SECTIONS: Record<
  DemoSection,
  (props: { demo: LodgingDemo }) => ReactNode
> = {
  gallery: Gallery,
  rooms: Rooms,
  amenities: Amenities,
  destination: Destination,
  testimonials: Testimonials,
  faq: Faq,
};

/**
 * Monta a página inteira a partir do dado.
 *
 * A ordem das seções vem do Design DNA e só entram as que têm conteúdo, então
 * uma demo sem depoimentos simplesmente não tem esse trecho — sem buraco no
 * espaçamento, porque a folga é o `margin-top` da seção seguinte.
 */
export function LodgingDemoPage({ demo }: { demo: LodgingDemo }) {
  const sections = visibleSections(demo);
  // Heros que ocupam a tela inteira não comportam o parágrafo de abertura.
  const introOutsideHero = demo.design.hero === "fullscreen";

  return (
    <div
      className={cn("lodging-demo", typographyClassName(demo.design.typography))}
      style={demoThemeStyle(demo.design)}
    >
      <DemoNotice />

      <main>
        <Hero demo={demo} />
        {introOutsideHero ? <Intro demo={demo} /> : null}

        {sections.map((section) => {
          const Section = SECTIONS[section];
          return <Section key={section} demo={demo} />;
        })}

        <FinalCta demo={demo} />
      </main>

      <DemoFooter demo={demo} />
    </div>
  );
}
