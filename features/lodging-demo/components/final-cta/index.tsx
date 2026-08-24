import { imageForRole } from "../../lib/section-visibility";
import type { LodgingDemo } from "../../types/lodging-demo";
import { BookingLink } from "../booking-link";
import { WhatsappLink } from "../contact-links";
import { DemoImage } from "../demo-image";

interface FinalCtaProps {
  demo: LodgingDemo;
}

/**
 * O último empurrão para o motor de reservas.
 *
 * A frase de fechamento vem do dado (`tagline`) ou do endereço — nunca de um
 * texto genérico de turismo. Se a demo não tiver nem um nem outro, sobra o
 * nome da casa, que já basta.
 */
export function FinalCta({ demo }: FinalCtaProps) {
  switch (demo.design.finalCta) {
    case "photographic":
      return <PhotographicCta demo={demo} />;
    case "typographic":
      return <TypographicCta demo={demo} />;
    case "minimal":
      return <MinimalCta demo={demo} />;
  }
}

/** Fechamento vindo do dado; sem ele, o nome da casa já basta. */
function closingLine(demo: LodgingDemo): string {
  return demo.closingHeadline ?? demo.tagline ?? demo.name;
}

function addressLine(demo: LodgingDemo): string {
  const { address, district, city, state } = demo.location;
  return [address, district, `${city} — ${state}`].filter(Boolean).join(", ");
}

/* ------------------------------------------------------------ photographic */

function PhotographicCta({ demo }: FinalCtaProps) {
  const image = imageForRole(demo, "final-cta");

  return (
    <section
      id="reservar"
      className="relative mt-[var(--demo-gap)] flex min-h-[70svh] items-end overflow-hidden"
    >
      {image ? (
        <>
          <DemoImage image={image} fill sizes="100vw" className="-z-20" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/10"
          />
        </>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-5 pb-14 pt-28 text-white sm:px-8 sm:pb-20">
        <h2 className="demo-display max-w-2xl text-[clamp(1.9rem,5.5vw,3.5rem)] leading-[1.05]">
          {closingLine(demo)}
        </h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80">
          {addressLine(demo)}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <BookingLink href={demo.bookingUrl} tone="on-photo">
            Ver disponibilidade
          </BookingLink>
          <WhatsappLink demo={demo} className="on-photo text-white" verbose />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- typographic */

/** Sem foto: o bloco vira uma página de rosto, com o nome em corpo enorme. */
function TypographicCta({ demo }: FinalCtaProps) {
  return (
    <section
      id="reservar"
      className="mt-[var(--demo-gap)] bg-[var(--demo-surface)]"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="demo-eyebrow">Reservas</p>
        <p className="demo-display mt-6 max-w-4xl text-[clamp(2rem,7vw,4.5rem)] uppercase leading-[0.95] tracking-[-0.02em]">
          {closingLine(demo)}
        </p>
        <div className="mt-10 grid gap-8 border-t border-[var(--demo-rule)] pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <p className="text-sm leading-relaxed text-[var(--demo-muted)]">
            {addressLine(demo)}
          </p>
          <div className="flex flex-col items-start gap-3">
            <WhatsappLink demo={demo} verbose />
          </div>
          <div className="sm:col-span-2 lg:col-span-1 lg:justify-self-end">
            <BookingLink href={demo.bookingUrl} tone="solid">
              Ver disponibilidade
            </BookingLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ minimal */

function MinimalCta({ demo }: FinalCtaProps) {
  return (
    <section
      id="reservar"
      className="mx-auto mt-[var(--demo-gap)] max-w-6xl px-5 sm:px-8"
    >
      <div className="border-t border-[var(--demo-rule)] pt-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <p className="demo-display max-w-md text-[clamp(1.5rem,3.5vw,2.25rem)] leading-tight">
            {closingLine(demo)}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <WhatsappLink demo={demo} verbose />
            <BookingLink href={demo.bookingUrl} tone="outline">
              Ver disponibilidade
            </BookingLink>
          </div>
        </div>
      </div>
    </section>
  );
}
