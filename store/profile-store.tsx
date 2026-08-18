"use client";

import * as React from "react";

import { MOCK_USER } from "@/data/mockSettings";
import { getSettings, updateProfile } from "@/services/settings";
import type { UserProfile } from "@/types";

interface ProfileContextValue {
  profile: UserProfile;
  saveProfile: (profile: UserProfile) => Promise<UserProfile>;
}

const ProfileContext = React.createContext<ProfileContextValue | null>(null);

/**
 * Perfil do usuário logado. Enquanto não há autenticação real, o perfil vem do
 * serviço de configurações e pode ser editado em /configuracoes.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = React.useState<UserProfile>(MOCK_USER);

  React.useEffect(() => {
    let active = true;
    void getSettings().then((settings) => {
      if (active) setProfile(settings.profile);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = React.useMemo<ProfileContextValue>(
    () => ({
      profile,
      saveProfile: async (next) => {
        const saved = await updateProfile(next);
        setProfile(saved);
        return saved;
      },
    }),
    [profile]
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
