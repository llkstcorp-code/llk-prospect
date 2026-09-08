"use client";

import * as React from "react";
import { Check, Loader2, Plus } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/store/leads-store";
import type { Business } from "@/types";

interface AddLeadButtonProps {
  business: Business;
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}

/**
 * Adiciona a empresa ao CRM de onde ela estiver na tela.
 *
 * Cuida do próprio estado e fala com o store direto, então quem lista empresas
 * — tabela, card, resultado de busca — só precisa renderizar o botão, sem
 * repassar callback nenhum.
 */
export function AddLeadButton({
  business,
  size = "sm",
  className,
}: AddLeadButtonProps) {
  const { findByBusinessId, addLead } = useLeads();
  const { toast } = useToast();
  const [isPending, setIsPending] = React.useState(false);

  const isInCrm = Boolean(findByBusinessId(business.id));

  async function handleClick() {
    setIsPending(true);
    try {
      await addLead(business.id);
      toast({
        title: "Empresa adicionada aos leads",
        description: `${business.name} está na etapa Novo do seu CRM.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Não foi possível adicionar o lead",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        variant: "error",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      size={size}
      className={className}
      onClick={() => void handleClick()}
      disabled={isInCrm || isPending}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : isInCrm ? (
        <Check data-icon="inline-start" />
      ) : (
        <Plus data-icon="inline-start" />
      )}
      {isInCrm ? "No CRM" : "Adicionar"}
    </Button>
  );
}
