import "server-only";

import { cache } from "react";
import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProspectingPreferences, UserProfile } from "@/types";

/**
 * Camada de acesso à sessão.
 *
 * O proxy faz uma checagem otimista pelo cookie e serve para redirecionar cedo;
 * ele não é garantia de nada. A verificação que vale é esta, feita ao lado dos
 * dados, em toda rota e todo repositório.
 */

export interface SessionUser {
  id: string;
  email: string;
}

/**
 * Usuário da requisição, ou null. Memoizado pelo `cache` do React para que
 * várias chamadas dentro da mesma renderização não repitam a validação.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await getSupabaseServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email ?? "" };
  } catch (error) {
    // Sem conseguir validar, o acesso é negado. Falhar fechado é o único
    // comportamento aceitável aqui.
    console.error("Falha ao validar a sessão:", error);
    return null;
  }
});

/** Igual ao anterior, mas falha quando não há sessão. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("Sessão expirada ou inexistente.");
    this.name = "UnauthenticatedError";
  }
}

/**
 * Resposta padrão para requisição sem sessão. As rotas usam isto em vez de
 * inventar cada uma o seu formato de erro.
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Faça login para continuar." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

export function isUnauthenticated(error: unknown): boolean {
  return error instanceof UnauthenticatedError;
}

/**
 * Guarda das rotas de API: devolve a resposta 401 quando não há sessão, ou null
 * quando pode seguir. O proxy já barra antes, mas a verificação que conta é
 * esta — o proxy pode ser contornado por qualquer chamada que não passe por ele.
 */
export async function guardSession(): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  return user ? null : unauthorizedResponse();
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  company: string;
  role_title: string;
  preferences: Partial<ProspectingPreferences> | null;
}

/** Iniciais para o avatar: "Ana Paula" vira "AP", "LLK" continua "LLK". */
function toInitials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return email.slice(0, 2).toLocaleUpperCase("pt-BR");
  if (parts.length === 1) {
    return parts[0].slice(0, 3).toLocaleUpperCase("pt-BR");
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("pt-BR");
}

export interface CurrentProfile {
  profile: UserProfile;
  preferences: Partial<ProspectingPreferences>;
}

/** Perfil do usuário logado, já no formato que a interface consome. */
export async function getCurrentProfile(): Promise<CurrentProfile> {
  const user = await requireUser();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, company, role_title, preferences")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar perfil: ${error.message}`);

  const row = (data as ProfileRow | null) ?? null;
  const name = row?.name || user.email.split("@")[0];
  const email = row?.email || user.email;

  return {
    profile: {
      name,
      email,
      company: row?.company || "LLK",
      role: row?.role_title || "Comercial",
      initials: toInitials(name, email),
    },
    preferences: row?.preferences ?? {},
  };
}
