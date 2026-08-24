import type { LodgingDemo } from "../types/lodging-demo";
import { DemoSection } from "./section";

/**
 * Parágrafo de abertura para os heros que não comportam texto longo (o
 * fullscreen, por exemplo). Um dedo de recuo à esquerda e corpo maior que o
 * resto: é o único bloco de texto puro da página.
 */
export function Intro({ demo }: { demo: LodgingDemo }) {
  if (!demo.description) return null;

  return (
    <DemoSection id="apresentacao">
      <p className="max-w-3xl text-[clamp(1.05rem,2.6vw,1.5rem)] leading-[1.55] lg:ml-[8%]">
        {demo.description}
      </p>
    </DemoSection>
  );
}
