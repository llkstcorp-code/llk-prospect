import { cn } from "@/lib/utils";

import type { LodgingDemo } from "../types/lodging-demo";

/** Formata "5535999990000" como "+55 35 99999-0000". */
function formatWhatsapp(digits: string): string {
  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const rest = digits.slice(4);
  const middle = rest.length > 8 ? rest.slice(0, 5) : rest.slice(0, 4);
  return `+${country} ${area} ${middle}-${rest.slice(middle.length)}`;
}

interface ContactLinkProps {
  demo: LodgingDemo;
  className?: string;
  /** Mostra o número por extenso, em vez de só "WhatsApp". */
  verbose?: boolean;
}

/**
 * WhatsApp só aparece quando o dado existe — nunca com número inventado.
 * Devolve `null` para que quem chama possa colapsar o espaço em volta.
 */
export function WhatsappLink({ demo, className, verbose }: ContactLinkProps) {
  if (!demo.whatsapp) return null;

  return (
    <a
      href={`https://wa.me/${demo.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn(
        "inline-flex items-baseline border-b border-current/40 pb-0.5 text-sm transition-colors hover:border-current",
        className
      )}
    >
      {verbose ? formatWhatsapp(demo.whatsapp) : "Falar no WhatsApp"}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

export function InstagramLink({ demo, className }: ContactLinkProps) {
  if (!demo.instagram) return null;

  return (
    <a
      href={`https://instagram.com/${demo.instagram}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn(
        "inline-flex items-baseline border-b border-current/40 pb-0.5 text-sm transition-colors hover:border-current",
        className
      )}
    >
      @{demo.instagram}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}
