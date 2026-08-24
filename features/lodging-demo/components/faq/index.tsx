import type { LodgingDemo } from "../../types/lodging-demo";
import { DemoSection, SectionHeading } from "../section";

interface FaqProps {
  demo: LodgingDemo;
}

/**
 * `<details>` nativo: abre/fecha, é acessível por teclado e encontrável pelo
 * Ctrl+F do navegador sem uma linha de JavaScript no cliente.
 */
export function Faq({ demo }: FaqProps) {
  const items = demo.faq;
  if (!items || items.length === 0) return null;

  return (
    <DemoSection id="duvidas">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <SectionHeading eyebrow="Antes de reservar" />

        <div className="border-t border-[var(--demo-rule)]">
          {items.map((item) => (
            <details
              key={item.question}
              className="group border-b border-[var(--demo-rule)]"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 text-[0.975rem] leading-snug marker:hidden">
                {item.question}
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-[var(--demo-muted)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="demo-prose pb-6 text-[0.95rem] leading-[1.75] text-[var(--demo-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </DemoSection>
  );
}
