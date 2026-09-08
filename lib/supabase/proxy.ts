import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh da sessão no proxy.
 *
 * Server Components não conseguem escrever cookies, então é aqui — antes de
 * qualquer renderização — que o token renovado é gravado na resposta. Sem esta
 * etapa o usuário é deslogado sozinho quando o access token expira.
 *
 * Devolve a resposta (já com os cookies atualizados) e o usuário da sessão,
 * para o proxy decidir se redireciona.
 */
export async function refreshSession(request: NextRequest): Promise<{
  response: NextResponse;
  userId: string | null;
}> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { response, userId: null };

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        // Resposta que grava cookie de sessão não pode ser cacheada por CDN,
        // senão o token de uma pessoa é servido para outra.
        Object.entries(headers ?? {}).forEach(([header, headerValue]) => {
          response.headers.set(header, headerValue);
        });
      },
    },
  });

  // getUser() valida o token no servidor do Supabase. getSession() só lê o
  // cookie, que é falsificável — não serve para decidir acesso.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { response, userId: user?.id ?? null };
  } catch (error) {
    // Supabase fora do ar derruba a validação, não o site inteiro: trata como
    // sessão ausente, e as rotas públicas continuam abrindo.
    console.error("Falha ao validar a sessão:", error);
    return { response, userId: null };
  }
}
