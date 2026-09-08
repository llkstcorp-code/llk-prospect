"use client";

import * as React from "react";
import { Mail, MessageCircle, Pencil, Phone, Plus, Trash2, UserRound } from "lucide-react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { useToast } from "@/components/common/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
} from "@/services/contacts";
import type { Contact, ContactInput } from "@/types";
import { ContactDialog } from "./contact-dialog";

interface ContactsCardProps {
  businessId: string;
  className?: string;
  /** Avisa a ficha da empresa de quem é o contato padrão da abordagem. */
  onPrimaryChange?: (contact: Contact | null) => void;
  /** Lista completa, para o diálogo de abrir negócio escolher o contato. */
  onContactsChange?: (contacts: Contact[]) => void;
}

export function ContactsCard({
  businessId,
  className,
  onPrimaryChange,
  onContactsChange,
}: ContactsCardProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Contact | undefined>();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<Contact | null>(null);

  const notifyPrimary = React.useCallback(
    (list: Contact[]) => {
      onPrimaryChange?.(list.find((item) => item.isPrimary) ?? list[0] ?? null);
      onContactsChange?.(list);
    },
    [onPrimaryChange, onContactsChange]
  );

  React.useEffect(() => {
    let active = true;

    void getContacts(businessId)
      .then((result) => {
        if (!active) return;
        setContacts(result);
        notifyPrimary(result);
      })
      .catch(() => {
        if (active) {
          toast({ title: "Não foi possível carregar os contatos", variant: "error" });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [businessId, notifyPrimary, toast]);

  // Uma alteração pode mover o "principal" de um contato para outro, então a
  // lista inteira é recarregada em vez de remendada item a item.
  async function reload() {
    const result = await getContacts(businessId);
    setContacts(result);
    notifyPrimary(result);
  }

  async function handleSubmit(input: ContactInput) {
    if (editing) {
      await updateContact(editing.id, input);
      toast({ title: "Contato atualizado", variant: "success" });
    } else {
      await createContact(input);
      toast({ title: "Contato cadastrado", variant: "success" });
    }
    await reload();
  }

  async function handleDelete() {
    if (!removing) return;
    try {
      await deleteContact(removing.id);
      await reload();
      toast({ title: "Contato removido", variant: "success" });
    } catch {
      toast({ title: "Não foi possível remover o contato", variant: "error" });
    } finally {
      setRemoving(null);
    }
  }

  function openNew() {
    setEditing(undefined);
    setIsDialogOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditing(contact);
    setIsDialogOpen(true);
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Contatos</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={openNew}>
            <Plus data-icon="inline-start" />
            Novo
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Nenhum contato cadastrado"
            description="Registre com quem você fala nesta empresa — a abordagem passa a ser endereçada a uma pessoa, não à razão social."
            action={
              <Button variant="outline" size="sm" onClick={openNew}>
                <Plus data-icon="inline-start" />
                Cadastrar contato
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{contact.name}</p>
                    {contact.isPrimary ? (
                      <Badge variant="secondary">Principal</Badge>
                    ) : null}
                    {contact.role ? (
                      <span className="text-xs text-muted-foreground">
                        {contact.role}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {contact.phone ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {contact.phone}
                      </span>
                    ) : null}
                    {contact.whatsapp ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle className="size-3.5" />
                        {contact.whatsapp}
                      </span>
                    ) : null}
                    {contact.email ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        {contact.email}
                      </span>
                    ) : null}
                  </div>

                  {contact.notes ? (
                    <p className="text-xs text-muted-foreground">
                      {contact.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Editar ${contact.name}`}
                    onClick={() => openEdit(contact)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remover ${contact.name}`}
                    onClick={() => setRemoving(contact)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ContactDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        businessId={businessId}
        contact={editing}
        isFirst={contacts.length === 0}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remover ${removing?.name ?? "contato"}?`}
        description={
          removing?.isPrimary
            ? "Este é o contato principal. O mais antigo dos restantes assume o lugar."
            : "O contato sai da ficha desta empresa."
        }
        confirmLabel="Remover"
        onConfirm={handleDelete}
      />
    </Card>
  );
}
