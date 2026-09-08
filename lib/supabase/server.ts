import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Clientes Supabase do servidor.
 *
 * São dois, e a diferença importa: `getSupabaseServerClient()` fala com o banco
 * **como o usuário logado**, sujeito ao RLS, e é o que as rotas e os
 * repositórios devem usar. `getSupabaseAdminClient()` ignora o RLS e existe só
 * para tarefas sem usuário (seed, jobs).
 *
 * O cliente de usuário nunca é cacheado em módulo: em Node o módulo é
 * compartilhado por todas as requisições do processo, então guardar a instância
 * entregaria a sessão de uma pessoa para a próxima.
 */

function readPublicConfig(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local."
    );
  }
  return { url, key };
}

/** Cliente ligado à sessão da requisição. Um por requisição, sempre novo. */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const { url, key } = readPublicConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components não podem escrever cookies. O refresh do token
          // acontece no proxy, que roda antes e já grava a versão nova.
        }
      },
    },
  });
}

/**
 * Cliente com a chave de serviço: ignora RLS.
 *
 * Só para operação sem usuário. Nunca use para responder uma requisição do
 * painel — seria voltar ao estado em que qualquer pessoa via os dados de todas.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no .env.local."
    );
  }

  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
