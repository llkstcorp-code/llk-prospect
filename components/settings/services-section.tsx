"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { useToast } from "@/components/common/toast";
import { ServiceDialog } from "@/components/settings/service-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServiceTypeLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import {
  createService,
  deleteService,
  updateService,
} from "@/services/settings";
import type { ServiceOffering } from "@/types";

type ServiceInput = Omit<ServiceOffering, "id">;

interface ServicesSectionProps {
  services: ServiceOffering[];
  onChange: (services: ServiceOffering[]) => void;
}

export function ServicesSection({ services, onChange }: ServicesSectionProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ServiceOffering | undefined>();
  const [pendingRemoval, setPendingRemoval] = React.useState<
    ServiceOffering | undefined
  >();
  /** Remonta o formulário a cada abertura para começar sempre limpo. */
  const [dialogKey, setDialogKey] = React.useState(0);

  function openDialog(service?: ServiceOffering) {
    setEditing(service);
    setDialogKey((key) => key + 1);
    setIsDialogOpen(true);
  }

  async function handleSubmit(input: ServiceInput) {
    try {
      if (editing) {
        const updated = await updateService(editing.id, input);
        onChange(
          services.map((service) =>
            service.id === updated.id ? updated : service
          )
        );
        toast({ title: "Serviço atualizado", variant: "success" });
      } else {
        const created = await createService(input);
        onChange([...services, created]);
        toast({ title: "Serviço cadastrado", variant: "success" });
      }
    } catch {
      toast({ title: "Não foi possível salvar o serviço", variant: "error" });
    }
  }

  async function handleDelete() {
    if (!pendingRemoval) return;
    try {
      await deleteService(pendingRemoval.id);
      onChange(services.filter((service) => service.id !== pendingRemoval.id));
      toast({ title: "Serviço removido", variant: "success" });
    } catch {
      toast({ title: "Não foi possível remover o serviço", variant: "error" });
    }
  }

  return (
    <Card className="[--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardTitle>Serviços</CardTitle>
        <CardDescription>
          Catálogo usado nas recomendações e no valor estimado de cada lead.
        </CardDescription>
        <CardAction>
          <Button size="sm" onClick={() => openDialog()}>
            <Plus data-icon="inline-start" />
            Novo serviço
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Nenhum serviço cadastrado"
            description="Cadastre os serviços da LLK para que o sistema recomende a melhor oferta para cada empresa."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-border">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <p className="font-medium">{service.name}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {getServiceTypeLabel(service.type)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground text-pretty">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="font-medium tabular-nums">
                      {formatPrice(service.price, service.priceModel)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Score mínimo {service.minScore}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${service.name}`}
                      onClick={() => openDialog(service)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remover ${service.name}`}
                      onClick={() => setPendingRemoval(service)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ServiceDialog
        key={dialogKey}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(undefined);
        }}
        title={`Remover ${pendingRemoval?.name ?? "serviço"}?`}
        description="O serviço deixa de aparecer nas recomendações. Os leads já criados mantêm o valor registrado."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </Card>
  );
}
