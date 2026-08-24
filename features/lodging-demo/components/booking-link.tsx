import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BookingLinkTone = "solid" | "outline" | "underline" | "on-photo";

interface BookingLinkProps {
  href: string;
  children: ReactNode;
  tone?: BookingLinkTone;
  className?: string;
}

const TONES: Record<BookingLinkTone, string> = {
  solid:
    "bg-[var(--demo-accent)] text-[var(--demo-accent-fg)] px-7 py-3.5 hover:opacity-90",
  outline:
    "border border-[var(--demo-fg)] px-7 py-3.5 hover:bg-[var(--demo-fg)] hover:text-[var(--demo-bg)]",
  underline:
    "border-b border-[var(--demo-fg)] pb-1 hover:border-[var(--demo-accent)] hover:text-[var(--demo-accent)]",
  "on-photo":
    "on-photo bg-white/95 text-neutral-950 px-7 py-3.5 hover:bg-white",
};

/**
 * Único caminho para o motor de reservas.
 *
 * Todos os CTAs de disponibilidade passam por aqui para que o `bookingUrl` do
 * dado nunca seja duplicado à mão e para que os atributos de segurança do link
 * externo fiquem em um lugar só.
 */
export function BookingLink({
  href,
  children,
  tone = "solid",
  className,
}: BookingLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn(
        "inline-flex items-center justify-center text-sm font-medium tracking-wide transition-colors",
        TONES[tone],
        className
      )}
    >
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}
