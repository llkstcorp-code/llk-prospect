import type { Metadata } from "next";

import { Brand } from "@/components/layout/brand";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage(props: PageProps<"/entrar">) {
  const { destino } = await props.searchParams;
  const destination = typeof destino === "string" ? destino : "/dashboard";

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Brand />
          <p className="text-sm text-muted-foreground">
            Entre para acessar o funil comercial.
          </p>
        </div>

        <Card className="px-(--card-spacing)">
          <LoginForm destination={destination} />
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          As contas são criadas pela LLK. Perdeu o acesso? Fale com o
          administrador.
        </p>
      </div>
    </main>
  );
}
