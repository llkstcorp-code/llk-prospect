import type { LodgingDemo } from "../../types/lodging-demo";
import { DemoSection, SectionHeading } from "../section";

interface AmenitiesProps {
  demo: LodgingDemo;
}

/**
 * Lista tipográfica, não grade de ícones em caixinhas.
 *
 * O item vira uma linha com régua fina: a leitura fica vertical e rápida, e o
 * detalhe (quando existe) qualifica o item em vez de repeti-lo.
 */
export function Amenities({ demo }: AmenitiesProps) {
  const amenities = demo.amenities;
  if (!amenities || amenities.length === 0) return null;

  const airy = demo.design.density === "airy";

  return (
    <DemoSection id="estrutura">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <SectionHeading eyebrow="O que está incluído" />

        <ul
          className={
            airy
              ? "grid gap-x-12 sm:grid-cols-2"
              : "grid gap-x-12 sm:grid-cols-2 lg:grid-cols-2"
          }
        >
          {amenities.map((amenity) => (
            <li
              key={amenity.label}
              className="border-t border-[var(--demo-rule)] py-4"
            >
              <p className="text-[0.975rem] leading-snug">{amenity.label}</p>
              {amenity.detail ? (
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--demo-muted)]">
                  {amenity.detail}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </DemoSection>
  );
}
