import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <Compass className="size-5 text-muted-foreground" />
      </div>
      <h1 className="mt-4 font-heading text-xl font-medium">
        Página não encontrada
      </h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        O endereço acessado não existe no LLK Prospect ou foi movido.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/dashboard">Ir para o dashboard</Link>
      </Button>
    </main>
  );
}
