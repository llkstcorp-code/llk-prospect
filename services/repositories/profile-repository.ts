import "server-only";

import {
  getCurrentProfile,
  requireUser,
  type CurrentProfile,
} from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProspectingPreferences, UserProfile } from "@/types";

/**
 * Perfil e preferências do usuário logado.
 *
 * Antes viviam em variáveis de módulo dentro de `services/settings.ts`. Com um
 * usuário só isso passava despercebido; com dois, o que uma pessoa salvava
 * aparecia para a outra — o processo do servidor é compartilhado.
 */

export async function updateStoredProfile(
  profile: UserProfile
): Promise<CurrentProfile> {
  const user = await requireUser();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      name: profile.name,
      company: profile.company,
      role_title: profile.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(`Falha ao salvar perfil: ${error.message}`);
  return getCurrentProfile();
}

export async function updateStoredPreferences(
  preferences: ProspectingPreferences
): Promise<CurrentProfile> {
  const user = await requireUser();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ preferences, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Falha ao salvar preferências: ${error.message}`);
  }
  return getCurrentProfile();
}
