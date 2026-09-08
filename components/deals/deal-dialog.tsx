"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { findService } from "@/lib/service-catalog";
import { useServices } from "@/store/services-store";
import type { Business, Contact, DealInput } from "@/types";

const NO_CONTACT = "nenhum";

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: Business;
  contacts: Contact[];
  /** Quantos negócios a empresa já teve — usado para sugerir o título. */
  existingCount: number;
  onSubmit: (input: DealInput) => Promise<void>;
}

/**
 * Abre um negócio para a empresa.
 *
 * O título é o que distingue dois negócios do mesmo cliente no Kanban, então
 * vem sugerido a partir do serviço e do que já existe — "Site Profissional",
 * depois "SEO (2º negócio)". Quem quiser trocar, troca.
 */
export function DealDialog({
  open,
  onOpenChange,
  business,
  contacts,
  existingCount,
  onSubmit,
}: DealDialogProps) {
  const { catalog } = useServices();
  const [serviceId, setServiceId] = React.useState(
    business.recommendedServiceId
  );
  const [title, setTitle] = React.useState("");
  const [contactId, setContactId] = React.useState(NO_CONTACT);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const service = findService(catalog, serviceId);

  function suggestTitle(id: string): string {
    const name = findService(catalog, id)?.name ?? "Novo negócio";
    return existingCount > 0 ? `${name} (${existingCount + 1}º negócio)` : name;
  }

  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setServiceId(business.recommendedServiceId);
      setTitle(suggestTitle(business.recommendedServiceId));
      setContactId(
        contacts.find((contact) => contact.isPrimary)?.id ?? NO_CONTACT
      );
      setError(null);
    }
  }

  function handleServiceChange(id: string) {
    // O título só acompanha o serviço enquanto for o sugerido: depois que a
    // pessoa escreve o dela, trocar o serviço não apaga o que ela digitou.
    if (title === suggestTitle(serviceId)) setTitle(suggestTitle(id));
    setServiceId(id);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({
        businessId: business.id,
        title: title.trim(),
        serviceId,
        contactId: contactId === NO_CONTACT ? null : contactId,
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível abrir o negócio."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Abrir negócio</DialogTitle>
          <DialogDescription>
            {existingCount > 0
              ? `${business.name} já teve ${existingCount} ${existingCount === 1 ? "negócio" : "negócios"}. Este entra no funil como um novo.`
              : `Primeiro negócio com ${business.name}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="deal-service">Serviço</Label>
            <Select value={serviceId} onValueChange={handleServiceChange}>
              <SelectTrigger id="deal-service" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {catalog.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {service ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(service.price)}
                {service.priceModel === "mensal" ? " por mês" : " único"}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deal-title">Título</Label>
            <Input
              id="deal-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              É o que diferencia este negócio dos outros da mesma empresa.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deal-contact">Contato</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger id="deal-contact" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CONTACT}>Sem contato definido</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                    {contact.role ? ` · ${contact.role}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : null}
              Abrir negócio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
