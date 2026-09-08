"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type SignInState } from "@/lib/auth/actions";

const INITIAL_STATE: SignInState = { error: null };

interface LoginFormProps {
  /** Caminho que a pessoa tentou abrir antes de ser mandada para cá. */
  destination: string;
}

export function LoginForm({ destination }: LoginFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    signIn,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="destino" value={destination} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="mt-1 w-full">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Entrando
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
