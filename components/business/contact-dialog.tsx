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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Contact, ContactInput } from "@/types";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  /** Contato em edição; ausente ao cadastrar um novo. */
  contact?: Contact;
  /** Verdadeiro quando é o primeiro contato da empresa. */
  isFirst: boolean;
  onSubmit: (input: ContactInput) => Promise<void>;
}

function emptyContact(businessId: string, isFirst: boolean): ContactInput {
  return {
    businessId,
    name: "",
    role: "",
    email: null,
    phone: null,
    whatsapp: null,
    isPrimary: isFirst,
    notes: "",
  };
}

export function ContactDialog({
  open,
  onOpenChange,
  businessId,
  contact,
  isFirst,
  onSubmit,
}: ContactDialogProps) {
  const [form, setForm] = React.useState<ContactInput>(() =>
    emptyContact(businessId, isFirst)
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm(
        contact
          ? {
              businessId: contact.businessId,
              name: contact.name,
              role: contact.role,
              email: contact.email,
              phone: contact.phone,
              whatsapp: contact.whatsapp,
              isPrimary: contact.isPrimary,
              notes: contact.notes,
            }
          : emptyContact(businessId, isFirst)
      );
      setError(null);
    }
  }

  function update<K extends keyof ContactInput>(
    key: K,
    value: ContactInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Informe o nome do contato.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar o contato."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Editar contato" : "Novo contato"}
          </DialogTitle>
          <DialogDescription>
            A pessoa com quem você fala nesta empresa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Nome</Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-role">Cargo</Label>
              <Input
                id="contact-role"
                placeholder="dono, gerente…"
                value={form.role}
                onChange={(event) => update("role", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">Telefone</Label>
              <Input
                id="contact-phone"
                type="tel"
                inputMode="tel"
                value={form.phone ?? ""}
                onChange={(event) => update("phone", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-whatsapp">WhatsApp</Label>
              <Input
                id="contact-whatsapp"
                type="tel"
                inputMode="tel"
                placeholder="se for diferente"
                value={form.whatsapp ?? ""}
                onChange={(event) => update("whatsapp", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-email">E-mail</Label>
            <Input
              id="contact-email"
              type="email"
              value={form.email ?? ""}
              onChange={(event) => update("email", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-notes">Observações</Label>
            <Textarea
              id="contact-notes"
              rows={2}
              placeholder="Melhor horário, como prefere ser abordado…"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 p-3">
            <Label htmlFor="contact-primary" className="flex-col items-start gap-0.5">
              Contato principal
              <span className="text-xs font-normal text-muted-foreground">
                É quem a abordagem usa por padrão.
              </span>
            </Label>
            <Switch
              id="contact-primary"
              checked={form.isPrimary}
              disabled={isFirst && !contact}
              onCheckedChange={(checked) => update("isPrimary", checked)}
            />
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
              {contact ? "Salvar" : "Cadastrar contato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
