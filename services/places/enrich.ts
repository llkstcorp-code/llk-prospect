/**
 * Enriquecimento sob demanda de uma única empresa.
 *
 * A Places API não devolve redes sociais nem e-mail. Aqui buscamos o site que a
 * própria empresa publicou — página pública dela, não conteúdo do Google — e
 * lemos os links de contato. Roda apenas quando o usuário abre uma empresa, uma
 * de cada vez, nunca em varredura.
 */

const REQUEST_TIMEOUT_MS = 8000;
const MAX_BYTES = 400_000;

/** Caminhos do Instagram que não são perfis. */
const INSTAGRAM_RESERVED = new Set([
  "p",
  "reel",
  "reels",
  "explore",
  "accounts",
  "stories",
  "tv",
  "direct",
  "about",
  "developer",
  "legal",
]);

const INSTAGRAM_PATTERN =
  /instagram\.com\/([A-Za-z0-9_][A-Za-z0-9_.]{1,29})/gi;
const MAILTO_PATTERN = /mailto:([^"'?\s>]+@[^"'?\s>]+)/gi;
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const IGNORED_EMAIL_SUFFIXES = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
];

export interface EnrichmentResult {
  instagram: string | null;
  email: string | null;
}

const EMPTY: EnrichmentResult = { instagram: null, email: null };

/** Bloqueia endereços internos: o alvo é sempre um site público. */
function isPublicHttpUrl(url: URL): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  if (host === "0.0.0.0" || host === "[::1]") return false;
  if (/^127\./.test(host)) return false;
  if (/^10\./.test(host)) return false;
  if (/^192\.168\./.test(host)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
  if (/^169\.254\./.test(host)) return false;

  return true;
}

function extractInstagram(html: string): string | null {
  for (const match of html.matchAll(INSTAGRAM_PATTERN)) {
    const handle = match[1];
    if (!handle || INSTAGRAM_RESERVED.has(handle.toLowerCase())) continue;
    return `@${handle.replace(/\.$/, "")}`;
  }
  return null;
}

function isUsableEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (IGNORED_EMAIL_SUFFIXES.some((suffix) => lower.endsWith(suffix))) {
    return false;
  }
  return !lower.includes("example.com") && !lower.startsWith("email@");
}

function extractEmail(html: string): string | null {
  for (const match of html.matchAll(MAILTO_PATTERN)) {
    const email = decodeURIComponent(match[1] ?? "");
    if (isUsableEmail(email)) return email;
  }
  for (const match of html.matchAll(EMAIL_PATTERN)) {
    if (isUsableEmail(match[0])) return match[0];
  }
  return null;
}

export async function enrichFromWebsite(
  websiteUri: string | null
): Promise<EnrichmentResult> {
  if (!websiteUri) return EMPTY;

  // O Google devolve URL absoluta, mas a base local guarda domínios simples.
  const normalized = /^https?:\/\//i.test(websiteUri)
    ? websiteUri
    : `https://${websiteUri}`;

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return EMPTY;
  }
  if (!isPublicHttpUrl(url)) return EMPTY;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "text/html,application/xhtml+xml" },
      cache: "no-store",
    });

    if (!response.ok) return EMPTY;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) return EMPTY;

    const html = (await response.text()).slice(0, MAX_BYTES);

    return {
      instagram: extractInstagram(html),
      email: extractEmail(html),
    };
  } catch {
    return EMPTY;
  }
}
