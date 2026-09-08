"use client";

import * as React from "react";

import { getProfile, updateProfile } from "@/services/settings";
import type { UserProfile } from "@/types";

interface ProfileContextValue {
  profile: UserProfile;
  isLoading: boolean;
  saveProfile: (profile: UserProfile) => Promise<UserProfile>;
}

const ProfileContext = React.createContext<ProfileContextValue | null>(null);

/**
 * Perfil vazio usado só enquanto a primeira resposta não chega. O nome real vem
 * de `/api/perfil`, que resolve pela sessão — não existe mais usuário padrão.
 */
const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  company: "",
  role: "",
  initials: "",
};

/** Perfil do usuário autenticado. */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = React.useState<UserProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    void getProfile()
      .then((result) => {
        if (active) setProfile(result.profile);
      })
      .catch(() => {
        // Sessão expirada: o proxy manda para /entrar na próxima navegação.
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = React.useMemo<ProfileContextValue>(
    () => ({
      profile,
      isLoading,
      saveProfile: async (next) => {
        const saved = await updateProfile(next);
        setProfile(saved);
        return saved;
      },
    }),
    [profile, isLoading]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const context = React.useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile precisa estar dentro de <ProfileProvider>.");
  }
  return context;
}
