/**
 * Validação dos arquivos de dados das demos.
 *
 * As demos são objetos escritos à mão. O TypeScript garante a forma, mas não
 * garante que o `bookingUrl` seja https, que o alt não esteja vazio ou que
 * dois quartos não repitam o mesmo id. Isso quebraria a página em produção,
 * então validamos no momento em que o registry é montado — o erro aparece no
 * `next build` e no `next dev`, não no navegador do prospect.
 */

import type { LodgingDemo, LodgingImage } from "../types/lodging-demo";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WHATSAPP_PATTERN = /^\d{10,15}$/;

class DemoIssues {
  private readonly issues: string[] = [];

  constructor(private readonly label: string) {}

  check(condition: boolean, message: string): void {
    if (!condition) this.issues.push(message);
  }

  throwIfAny(): void {
    if (this.issues.length === 0) return;
    throw new Error(
      `Demo inválida "${this.label}":\n` +
        this.issues.map((issue) => `  · ${issue}`).join("\n")
    );
  }
}

function validateImage(
  issues: DemoIssues,
  image: LodgingImage,
  where: string
): void {
  issues.check(
    image.src.startsWith("/"),
    `${where}: src deve ser um caminho local começando com "/" (recebido "${image.src}").`
  );
  issues.check(
    image.alt.trim().length > 0,
    `${where}: alt vazio. Toda imagem precisa de texto alternativo.`
  );
  issues.check(
    image.width > 0 && image.height > 0,
    `${where}: width e height precisam ser positivos.`
  );
}

/**
 * Lança um erro legível se a demo estiver inconsistente. Devolve a própria
 * demo para permitir uso em expressão.
 */
export function validateLodgingDemo(demo: LodgingDemo): LodgingDemo {
  const issues = new DemoIssues(demo.slug || demo.name || "sem slug");

  issues.check(
    SLUG_PATTERN.test(demo.slug),
    `slug "${demo.slug}" deve ser minúsculo, sem acentos e separado por hífens.`
  );
  issues.check(demo.name.trim().length > 0, "name não pode ser vazio.");
  issues.check(
    demo.location.city.trim().length > 0 &&
      demo.location.state.trim().length > 0,
    "location.city e location.state são obrigatórios."
  );

  let bookingUrl: URL | null = null;
  try {
    bookingUrl = new URL(demo.bookingUrl);
  } catch {
    bookingUrl = null;
  }
  issues.check(
    bookingUrl !== null,
    `bookingUrl "${demo.bookingUrl}" não é uma URL absoluta.`
  );
  issues.check(
    bookingUrl === null || bookingUrl.protocol === "https:",
    "bookingUrl precisa usar https."
  );

  if (demo.whatsapp !== undefined) {
    issues.check(
      WHATSAPP_PATTERN.test(demo.whatsapp),
      `whatsapp "${demo.whatsapp}" deve conter só dígitos, com DDI e DDD (ex.: 5535999990000).`
    );
  }
  if (demo.instagram !== undefined) {
    issues.check(
      !demo.instagram.startsWith("@"),
      `instagram "${demo.instagram}" deve vir sem "@".`
    );
  }

  issues.check(
    demo.images.length > 0,
    "images está vazio. A página precisa de ao menos a imagem do hero."
  );
  issues.check(
    demo.images.some((image) => image.role === "hero"),
    'nenhuma imagem com role "hero".'
  );
  demo.images.forEach((image, index) => {
    validateImage(issues, image, `images[${index}]`);
  });

  const roomIds = new Set<string>();
  demo.rooms?.forEach((room, index) => {
    issues.check(
      room.id.trim().length > 0 && !roomIds.has(room.id),
      `rooms[${index}]: id vazio ou repetido ("${room.id}").`
    );
    roomIds.add(room.id);
    issues.check(
      room.priceFrom === undefined || room.priceFrom > 0,
      `rooms[${index}]: priceFrom deve ser positivo ou ausente.`
    );
    if (room.image) validateImage(issues, room.image, `rooms[${index}].image`);
  });

  const testimonialIds = new Set<string>();
  demo.testimonials?.forEach((testimonial, index) => {
    issues.check(
      testimonial.id.trim().length > 0 && !testimonialIds.has(testimonial.id),
      `testimonials[${index}]: id vazio ou repetido ("${testimonial.id}").`
    );
    testimonialIds.add(testimonial.id);
    issues.check(
      testimonial.quote.trim().length > 0 &&
        testimonial.author.trim().length > 0,
      `testimonials[${index}]: quote e author são obrigatórios.`
    );
    if (testimonial.image) {
      validateImage(issues, testimonial.image, `testimonials[${index}].image`);
    }
  });

  if (demo.reviewSummary) {
    const { rating, count } = demo.reviewSummary;
    issues.check(
      rating >= 0 && rating <= 5,
      `reviewSummary.rating ${rating} fora da escala 0–5.`
    );
    issues.check(
      Number.isInteger(count) && count >= 0,
      `reviewSummary.count ${count} deve ser inteiro não negativo.`
    );
  }

  if (demo.provenance) {
    issues.check(
      ISO_DATE_PATTERN.test(demo.provenance.reviewedAt),
      `provenance.reviewedAt "${demo.provenance.reviewedAt}" deve estar em YYYY-MM-DD.`
    );
  }

  const paletteEntries = Object.entries(demo.design.palette);
  for (const [key, value] of paletteEntries) {
    issues.check(
      typeof value === "string" && value.trim().length > 0,
      `design.palette.${key} está vazio.`
    );
  }

  issues.throwIfAny();
  return demo;
}

/** Valida a coleção inteira e garante que não há slug duplicado. */
export function validateLodgingDemos(demos: LodgingDemo[]): LodgingDemo[] {
  const seen = new Set<string>();
  for (const demo of demos) {
    validateLodgingDemo(demo);
    if (seen.has(demo.slug)) {
      throw new Error(
        `Slug duplicado "${demo.slug}" em features/lodging-demo/data. Cada demo precisa de um slug único.`
      );
    }
    seen.add(demo.slug);
  }
  return demos;
}
