"use client";

import * as React from "react";
import { Check, Loader2, Plus } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { useDeals } from "@/store/deals-store";
import type { Business } from "@/types";

interface AddDealButtonProps {
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
export function AddDealButton({
  business,
  size = "sm",
  className,
}: AddDealButtonProps) {
  const { openDealOfBusiness, addDeal } = useDeals();
  const { toast } = useToast();
  const [isPending, setIsPending] = React.useState(false);

  // Só bloqueia enquanto houver negócio aberto. Depois de fechado ou perdido,
  // a mesma empresa pode voltar ao funil — é o ponto desta fase.
  const openDeal = openDealOfBusiness(business.id);
  const isInCrm = Boolean(openDeal);

  async function handleClick() {
    setIsPending(true);
    try {
      const deal = await addDeal({
        businessId: business.id,
        title: "",
        serviceId: business.recommendedServiceId,
        contactId: null,
      });
      toast({
        title: "Negócio aberto",
        description: `${deal.title} — ${business.name} está na etapa Novo.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Não foi possível abrir o negócio",
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
      {isInCrm ? "No funil" : "Abrir negócio"}
    </Button>
  );
}
