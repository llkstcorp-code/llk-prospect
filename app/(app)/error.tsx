"use client";

import { TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <Card>
      <EmptyState
        icon={TriangleAlert}
        title="Algo deu errado por aqui"
        description="Não foi possível carregar esta tela. Você pode tentar novamente sem perder o que já estava aberto."
        action={
          <Button variant="outline" onClick={reset}>
            Tentar novamente
          </Button>
        }
      />
    </Card>
  );
}
