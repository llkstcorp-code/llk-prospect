"use client";

import * as React from "react";

export type Theme = "claro" | "escuro" | "sistema";
export type ResolvedTheme = "claro" | "escuro";

/** Mesma chave lida pelo script inline do layout, antes da primeira pintura. */
const STORAGE_KEY = "llk-tema";

/**
 * O tema vive fora do React: quem manda na tela é a classe no <html>, aplicada
 * antes da hidratação. Por isso o estado é lido por `useSyncExternalStore` em
 * vez de `useState` — não há um "estado inicial do React" a sincronizar depois.
 */
const listeners = new Set<() => void>();
let current: Theme | null = null;

function isTheme(value: string | null): value is Theme {
  return value === "claro" || value === "escuro" || value === "sistema";
}

function prefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme !== "sistema") return theme;
  return prefersDark() ? "escuro" : "claro";
}

function apply(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "escuro");
  // Faz os controles nativos (rolagem, campos, seletores) seguirem o tema.
  root.style.colorScheme = resolved === "escuro" ? "dark" : "light";
}

function emit(): void {
  for (const listener of listeners) listener();
}

function getTheme(): Theme {
  if (current === null) {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    current = isTheme(stored) ? stored : "sistema";
  }
  return current;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const query = window.matchMedia("(prefers-color-scheme: dark)");

  // Enquanto a escolha for "sistema", a preferência do SO continua mandando.
  const onSystemChange = () => {
    if (getTheme() !== "sistema") return;
    apply(resolve("sistema"));
    onChange();
  };

  // Mantém as abas abertas em sincronia.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !isTheme(event.newValue)) return;
    current = event.newValue;
    apply(resolve(current));
    onChange();
  };

  query.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    query.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setTheme(next: Theme): void {
  current = next;
  apply(resolve(next));
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Navegação privada pode bloquear a escrita: o tema vale só nesta sessão.
  }
  emit();
}

interface UseThemeResult {
  theme: Theme;
  /** O tema de fato aplicado: resolve "sistema" para claro ou escuro. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export function useTheme(): UseThemeResult {
  const theme = React.useSyncExternalStore(
    subscribe,
    getTheme,
    // No servidor não há preferência a consultar; o script inline corrige antes
    // de qualquer pixel aparecer.
    () => "sistema" as Theme
  );

  const resolvedTheme = React.useSyncExternalStore(
    subscribe,
    () => resolve(getTheme()),
    () => "claro" as ResolvedTheme
  );

  return { theme, resolvedTheme, setTheme };
}
