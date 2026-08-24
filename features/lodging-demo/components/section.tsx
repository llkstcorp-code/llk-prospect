import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DemoSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Remove o padding lateral quando a seção sangra até a borda. */
  bleed?: boolean;
}

/**
 * Espaçamento vertical vem do Design DNA (`--demo-gap`), então uma demo "airy"
 * respira mais que uma "balanced" sem que cada seção precise saber disso.
 */
export function DemoSection({
  id,
  children,
  className,
  bleed = false,
}: DemoSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "mt-[var(--demo-gap)]",
        bleed ? undefined : "mx-auto max-w-6xl px-5 sm:px-8",
        className
      )}
    >
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title?: string;
  intro?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="demo-eyebrow">{eyebrow}</p>
      {title ? (
        <h2 className="demo-display mt-4 text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.08]">
          {title}
        </h2>
      ) : null}
      {intro ? (
        <p className="demo-prose mt-4 text-[0.975rem] leading-[1.75] text-[var(--demo-muted)]">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
