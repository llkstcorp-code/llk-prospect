import type { LodgingDemo, Testimonial } from "../../types/lodging-demo";
import { DemoImage } from "../demo-image";
import { DemoSection, SectionHeading } from "../section";

interface TestimonialsProps {
  demo: LodgingDemo;
}

export function Testimonials({ demo }: TestimonialsProps) {
  const testimonials = demo.testimonials;
  if (!testimonials || testimonials.length === 0) return null;

  switch (demo.design.testimonials) {
    case "quote":
      return <QuoteTestimonials demo={demo} testimonials={testimonials} />;
    case "minimal":
      return <MinimalTestimonials demo={demo} testimonials={testimonials} />;
    case "photographic":
      return (
        <PhotographicTestimonials demo={demo} testimonials={testimonials} />
      );
  }
}

/** Média de avaliações. Só aparece quando a fonte foi registrada no dado. */
function ReviewLine({ demo }: TestimonialsProps) {
  const summary = demo.reviewSummary;
  if (!summary) return null;

  const rating = summary.rating.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <p className="text-sm text-[var(--demo-muted)]">
      {rating} de 5 em {summary.count} avaliações
      {summary.source ? ` no ${summary.source}` : ""}
    </p>
  );
}

function Attribution({ testimonial }: { testimonial: Testimonial }) {
  return (
    <p className="mt-5 text-sm">
      <span className="font-medium">{testimonial.author}</span>
      {testimonial.context ? (
        <span className="text-[var(--demo-muted)]">
          {" "}
          · {testimonial.context}
        </span>
      ) : null}
    </p>
  );
}

/* -------------------------------------------------------------------- quote */

/** Uma citação grande de cada vez, em corpo de display. */
function QuoteTestimonials({
  demo,
  testimonials,
}: TestimonialsProps & { testimonials: Testimonial[] }) {
  return (
    <DemoSection id="depoimentos">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <SectionHeading eyebrow="Quem ficou" />
        <ReviewLine demo={demo} />
      </div>

      <div className="mt-10 space-y-12 sm:mt-14">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.id}
            className="border-t border-[var(--demo-rule)] pt-8"
          >
            <blockquote className="demo-display max-w-3xl text-[clamp(1.35rem,3.2vw,2rem)] leading-[1.35]">
              {testimonial.quote}
            </blockquote>
            <figcaption>
              <Attribution testimonial={testimonial} />
            </figcaption>
          </figure>
        ))}
      </div>
    </DemoSection>
  );
}

/* ------------------------------------------------------------------ minimal */

/** Colunas estreitas, texto pequeno, sem aspas decorativas. */
function MinimalTestimonials({
  demo,
  testimonials,
}: TestimonialsProps & { testimonials: Testimonial[] }) {
  return (
    <DemoSection id="depoimentos">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--demo-rule)] pb-5">
        <SectionHeading eyebrow="Quem ficou" />
        <ReviewLine demo={demo} />
      </div>

      <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure key={testimonial.id}>
            <blockquote className="text-[0.95rem] leading-[1.75]">
              {testimonial.quote}
            </blockquote>
            <figcaption>
              <Attribution testimonial={testimonial} />
            </figcaption>
          </figure>
        ))}
      </div>
    </DemoSection>
  );
}

/* ------------------------------------------------------------- photographic */

function PhotographicTestimonials({
  demo,
  testimonials,
}: TestimonialsProps & { testimonials: Testimonial[] }) {
  return (
    <DemoSection id="depoimentos">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <SectionHeading eyebrow="Quem ficou" />
        <ReviewLine demo={demo} />
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        {testimonials.map((testimonial) => (
          <figure key={testimonial.id}>
            {testimonial.image ? (
              <DemoImage
                image={testimonial.image}
                sizes="(max-width: 640px) 100vw, 45vw"
                className="aspect-[3/2] w-full"
              />
            ) : null}
            <blockquote className="mt-5 text-[0.975rem] leading-[1.75]">
              {testimonial.quote}
            </blockquote>
            <figcaption>
              <Attribution testimonial={testimonial} />
            </figcaption>
          </figure>
        ))}
      </div>
    </DemoSection>
  );
}
