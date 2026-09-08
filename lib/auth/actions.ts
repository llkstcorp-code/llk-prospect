"use server";

import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface SignInState {
  error: string | null;
}

/** Só aceita caminho interno: evita virar redirecionador aberto. */
function safeDestination(value: FormDataEntryValue | null): string {
  const destination = typeof value === "string" ? value : "";
  if (!destination.startsWith("/") || destination.startsWith("//")) {
    return "/dashboard";
  }
  return destination;
}

export async function signIn(
  _state: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("senha") ?? "");
  const destination = safeDestination(formData.get("destino"));

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase fora do ar não é senha errada. Sem essa distinção, uma queda do
    // serviço aparece como "senha incorreta" e a pessoa tenta trocar a senha.
    if (error.name === "AuthRetryableFetchError" || error.status === 0) {
      return {
        error: "Serviço de login indisponível. Tente novamente em instantes.",
      };
    }
    // Fora isso, a mensagem é a mesma para e-mail inexistente e senha errada:
    // dizer qual dos dois falhou entrega quem tem conta no sistema.
    return { error: "E-mail ou senha incorretos." };
  }

  redirect(destination);
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
