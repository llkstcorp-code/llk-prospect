import { imageForRole } from "../../lib/section-visibility";
import type { LodgingDemo } from "../../types/lodging-demo";
import { BookingLink } from "../booking-link";
import { WhatsappLink } from "../contact-links";
import { DemoImage } from "../demo-image";

interface HeroProps {
  demo: LodgingDemo;
}

function locationLine(demo: LodgingDemo): string {
  const { city, state, district } = demo.location;
  return [district, `${city}, ${state}`].filter(Boolean).join(" · ");
}

/**
 * O hero é o ponto onde as duas demos mais divergem: uma abre com tipografia
 * e a foto entrando de lado, a outra abre com a foto ocupando a tela inteira.
 */
export function Hero({ demo }: HeroProps) {
  switch (demo.design.hero) {
    case "fullscreen":
      return <FullscreenHero demo={demo} />;
    case "split":
      return <SplitHero demo={demo} />;
    case "editorial":
      return <EditorialHero demo={demo} />;
  }
}

/* ---------------------------------------------------------------- editorial */

function EditorialHero({ demo }: HeroProps) {
  const image = imageForRole(demo, "hero");

  return (
    <header className="mx-auto max-w-6xl px-5 pt-14 sm:px-8 sm:pt-20">
      <p className="demo-eyebrow">{locationLine(demo)}</p>

      <h1 className="demo-display mt-5 text-[clamp(2.75rem,10vw,6.5rem)] leading-[0.92]">
        {demo.name}
      </h1>

      {demo.tagline ? (
        <p className="demo-display mt-6 max-w-xl text-[clamp(1.25rem,3.4vw,1.75rem)] leading-[1.25] italic">
          {demo.tagline}
        </p>
      ) : null}

      {/*
        Assimetria controlada: a coluna da foto é bem mais larga que a do
        texto e alinha pela base, criando um degrau em vez de duas colunas
        simétricas. No mobile a ordem inverte para a foto vir antes do texto.
      */}
      <div className="mt-12 grid gap-x-10 gap-y-8 sm:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,10fr)] lg:items-end">
        <div className="order-2 lg:order-1 lg:pb-6">
          {demo.description ? (
            <p className="demo-prose text-[0.975rem] leading-[1.75]">
              {demo.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-4">
            <BookingLink href={demo.bookingUrl} tone="solid">
              Ver disponibilidade
            </BookingLink>
            <WhatsappLink demo={demo} />
          </div>
        </div>

        {image ? (
          <figure className="order-1 lg:order-2">
            <DemoImage
              image={image}
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="h-[46vh] w-full min-h-[260px] sm:h-[58vh] lg:h-[64vh]"
            />
            {image.caption ? (
              <figcaption className="mt-3 text-xs text-[var(--demo-muted)]">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- split */

function SplitHero({ demo }: HeroProps) {
  const image = imageForRole(demo, "hero");

  return (
    <header className="grid lg:min-h-[88svh] lg:grid-cols-2">
      <div className="flex flex-col justify-center px-5 py-16 sm:px-10 lg:py-20">
        <p className="demo-eyebrow">{locationLine(demo)}</p>
        <h1 className="demo-display mt-5 text-[clamp(2.5rem,7vw,4.75rem)] leading-[0.98]">
          {demo.name}
        </h1>
        {demo.tagline ? (
          <p className="mt-6 max-w-md text-lg leading-relaxed">
            {demo.tagline}
          </p>
        ) : null}
        {demo.description ? (
          <p className="demo-prose mt-5 text-[0.975rem] leading-[1.75] text-[var(--demo-muted)]">
            {demo.description}
          </p>
        ) : null}
        <div className="mt-9 flex flex-wrap items-baseline gap-x-8 gap-y-4">
          <BookingLink href={demo.bookingUrl} tone="solid">
            Ver disponibilidade
          </BookingLink>
          <WhatsappLink demo={demo} />
        </div>
      </div>

      {image ? (
        <div className="relative min-h-[52vh] lg:min-h-0">
          <DemoImage
            image={image}
            priority
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      ) : null}
    </header>
  );
}

/* --------------------------------------------------------------- fullscreen */

function FullscreenHero({ demo }: HeroProps) {
  const image = imageForRole(demo, "hero");

  return (
    <header className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden">
      {image ? (
        <>
          <DemoImage
            image={image}
            priority
            fill
            sizes="100vw"
            className="-z-20"
          />
          {/*
            Véu escuro só na base, onde o texto pousa. Cobrir a foto inteira
            apagaria a luz que dá o clima da imagem.
          */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
          />
        </>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-5 pb-14 pt-32 text-white sm:px-8 sm:pb-20">
        <p className="demo-eyebrow !text-white/70">{locationLine(demo)}</p>
        <h1 className="demo-display mt-4 max-w-4xl text-[clamp(2.5rem,8.5vw,5.75rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em]">
          {demo.name}
        </h1>
        {demo.tagline ? (
          <p className="mt-5 max-w-lg text-[clamp(1rem,2.4vw,1.25rem)] leading-snug text-white/90">
            {demo.tagline}
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <BookingLink href={demo.bookingUrl} tone="on-photo">
            Ver disponibilidade
          </BookingLink>
          <WhatsappLink demo={demo} className="on-photo text-white" />
        </div>
      </div>
    </header>
  );
}
