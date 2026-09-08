"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { useToast } from "@/components/common/toast";
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
import { Switch } from "@/components/ui/switch";
import { CATEGORIES } from "@/data/categories";
import { validateManualBusiness } from "@/lib/manual-business";
import { createManualBusiness } from "@/services/businesses";
import type { Business, CategoryId, ManualBusinessInput } from "@/types";

const EMPTY: ManualBusinessInput = {
  name: "",
  category: "outros",
  city: "",
  state: "MG",
  phone: "",
  address: "",
  website: "",
  instagram: "",
  hasWebsite: false,
  hasInstagram: false,
};

interface ManualBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chamado com a empresa já salva no banco. */
  onCreated: (business: Business) => void;
  /** Cidade e estado da última busca, para não redigitar. */
  defaultCity?: string;
  defaultState?: string;
}

/**
 * Cadastro de empresa que não veio de fonte pública — a indicação de um
 * cliente, o comércio visto na rua.
 *
 * "Possui site" e "Possui Instagram" são o que importa para o score; a URL é
 * opcional. Quem só sabe que a empresa não tem site já está dando a informação
 * mais valiosa do formulário.
 */
export function ManualBusinessDialog({
  open,
  onOpenChange,
  onCreated,
  defaultCity = "",
  defaultState = "MG",
}: ManualBusinessDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = React.useState<ManualBusinessInput>(EMPTY);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  // Reabrir o diálogo começa um cadastro novo, já com a região da última busca.
  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm({ ...EMPTY, city: defaultCity, state: defaultState });
      setErrors([]);
    }
  }

  function update<K extends keyof ManualBusinessInput>(
    key: K,
    value: ManualBusinessInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validateManualBusiness(form);
    setErrors(found);
    if (found.length > 0) return;

    setIsSaving(true);
    try {
      const business = await createManualBusiness(form);
      onCreated(business);
      onOpenChange(false);
      toast({
        title: "Empresa cadastrada",
        description: `${business.name} entrou na sua lista com score ${business.score}.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Não foi possível cadastrar a empresa",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar empresa</DialogTitle>
          <DialogDescription>
            Para empresas que não aparecem na busca — indicações, contatos de
            evento, comércio da região.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="manual-name">Nome</Label>
            <Input
              id="manual-name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="manual-category">Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  update("category", value as CategoryId)
                }
              >
                <SelectTrigger id="manual-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.singular}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manual-phone">Telefone</Label>
              <Input
                id="manual-phone"
                type="tel"
                inputMode="tel"
                placeholder="(35) 99999-0000"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
            <div className="space-y-1.5">
              <Label htmlFor="manual-city">Cidade</Label>
              <Input
                id="manual-city"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manual-state">Estado</Label>
              <Input
                id="manual-state"
                maxLength={2}
                value={form.state}
                onChange={(event) =>
                  update("state", event.target.value.toUpperCase())
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="manual-address">Endereço (opcional)</Label>
            <Input
              id="manual-address"
              value={form.address}
              onChange={(event) => update("address", event.target.value)}
            />
          </div>

          <div className="space-y-3 rounded-lg bg-secondary/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="manual-has-website">Possui site</Label>
              <Switch
                id="manual-has-website"
                checked={form.hasWebsite}
                onCheckedChange={(checked) => update("hasWebsite", checked)}
              />
            </div>
            {form.hasWebsite ? (
              <Input
                aria-label="Endereço do site"
                placeholder="empresa.com.br (opcional)"
                value={form.website}
                onChange={(event) => update("website", event.target.value)}
              />
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="manual-has-instagram">Possui Instagram</Label>
              <Switch
                id="manual-has-instagram"
                checked={form.hasInstagram}
                onCheckedChange={(checked) => update("hasInstagram", checked)}
              />
            </div>
            {form.hasInstagram ? (
              <Input
                aria-label="Perfil no Instagram"
                placeholder="@empresa (opcional)"
                value={form.instagram}
                onChange={(event) => update("instagram", event.target.value)}
              />
            ) : null}

            <p className="text-xs text-muted-foreground">
              A ausência de site é o que mais pesa no score — responder isso já
              vale mais do que qualquer outro campo opcional.
            </p>
          </div>

          {errors.length > 0 ? (
            <ul role="alert" className="space-y-1 text-sm text-destructive">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
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
              Cadastrar empresa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
