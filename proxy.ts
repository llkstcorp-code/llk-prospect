import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/supabase/proxy";

/**
 * Porta de entrada do painel.
 *
 * Faz duas coisas: renova o token da sessão (Server Components não conseguem
 * gravar cookies, então tem de ser aqui) e redireciona quem não está logado.
 *
 * A checagem daqui é otimista e serve para a navegação — a autorização de
 * verdade acontece ao lado dos dados, em `lib/auth/session.ts` e nas policies
 * de RLS do Supabase.
 */

/** Rota pública: aberta a quem não tem sessão. */
function isPublicPath(pathname: string): boolean {
  // As landing pages de demonstração são feitas para ser enviadas por link a um
  // prospect — exigir login mataria o propósito.
  if (pathname === "/demo" || pathname.startsWith("/demo/")) return true;
  return pathname === "/entrar";
}

/** Rota de autenticação: quem já tem sessão não precisa dela. */
function isAuthPath(pathname: string): boolean {
  return pathname === "/entrar";
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const { response, userId } = await refreshSession(request);

  if (userId && isAuthPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  if (userId || isPublicPath(pathname)) return response;

  // As rotas de API respondem 401 em vez de redirecionar: quem chamou foi o
  // `fetch` da interface, e um HTML de login no lugar do JSON só produziria um
  // erro de parse difícil de entender.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Faça login para continuar." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const login = new URL("/entrar", request.nextUrl);
  // Guarda o destino para devolver a pessoa onde ela tentou entrar.
  if (pathname !== "/") login.searchParams.set("destino", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  /*
   * `_next/static`, `_next/image` e os arquivos de imagem já ficam de fora do
   * matcher, então o CSS, o JS e as ilustrações das demos carregam sem
   * autenticação — sem isso a página pública abriria sem estilo.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
