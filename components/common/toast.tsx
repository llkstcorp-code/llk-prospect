"use client";

import * as React from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 4000;

const VARIANT_ICON: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

const VARIANT_ICON_STYLE: Record<ToastVariant, string> = {
  success: "text-positive",
  error: "text-destructive",
  info: "text-brand",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const nextId = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current, { ...options, id }]);
      setTimeout(() => dismiss(id), TOAST_DURATION);
    },
    [dismiss]
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-100 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((item) => {
          const variant = item.variant ?? "info";
          const Icon = VARIANT_ICON[variant];

          return (
            <div
              key={item.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm animate-in items-start gap-3 rounded-xl bg-background p-3.5 shadow-lg ring-1 ring-foreground/10 duration-200 fade-in-0 slide-in-from-bottom-2"
            >
              <Icon
                className={cn("mt-0.5 size-4 shrink-0", VARIANT_ICON_STYLE[variant])}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Fechar notificação"
                className="-m-1 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  }
  return context;
}
