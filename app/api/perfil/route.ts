import { NextResponse } from "next/server";

import { getCurrentProfile, guardSession } from "@/lib/auth/session";
import {
  updateStoredPreferences,
  updateStoredProfile,
} from "@/services/repositories/profile-repository";
import type { ProspectingPreferences, UserProfile } from "@/types";

interface UpdateProfileBody {
  profile?: UserProfile;
  preferences?: ProspectingPreferences;
}

export async function GET() {
  const denied = await guardSession();
  if (denied) return denied;

  try {
    return NextResponse.json(await getCurrentProfile());
  } catch (error) {
    console.error("Falha ao carregar perfil:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar seu perfil." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  let body: UpdateProfileBody;
  try {
    body = (await request.json()) as UpdateProfileBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  try {
    if (body.profile) {
      return NextResponse.json(await updateStoredProfile(body.profile));
    }
    if (body.preferences) {
      return NextResponse.json(
        await updateStoredPreferences(body.preferences)
      );
    }
    return NextResponse.json(
      { error: "Nenhuma alteração válida foi informada." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Falha ao salvar perfil:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar as alterações." },
      { status: 500 }
    );
  }
}
