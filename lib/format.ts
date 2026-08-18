import type { PriceModel } from "@/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const MS_PER_DAY = 86_400_000;

/**
 * Converte "2026-08-17" ou uma data ISO completa em `Date` no fuso local.
 * Evita o deslocamento de um dia que `new Date("2026-08-17")` provoca.
 */
export function parseDate(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3])
    );
  }
  return new Date(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPrice(value: number, model: PriceModel): string {
  return model === "mensal"
    ? `${currencyFormatter.format(value)}/mês`
    : currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatRating(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

/** "17/08" — usado em eixos de gráfico e timelines. */
export function formatShortDate(value: string): string {
  return shortDateFormatter.format(parseDate(value));
}

/** "17 de agosto de 2026". */
export function formatLongDate(value: string): string {
  return longDateFormatter.format(parseDate(value));
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Hoje", "Ontem", "Há 3 dias" ou a data curta quando for antigo. */
export function formatRelativeDate(value: string | null): string {
  if (!value) return "Sem contato";

  const diffInDays = Math.round(
    (startOfDay(new Date()) - startOfDay(parseDate(value))) / MS_PER_DAY
  );

  if (diffInDays <= 0) return "Hoje";
  if (diffInDays === 1) return "Ontem";
  if (diffInDays < 30) return `Há ${diffInDays} dias`;
  return formatShortDate(value);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
