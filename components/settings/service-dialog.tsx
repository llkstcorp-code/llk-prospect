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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { PRICE_MODELS, SERVICE_TYPES } from "@/lib/constants";
import { SCORE_MAX } from "@/lib/score";
import type { PriceModel, ServiceOffering, ServiceType } from "@/types";

type ServiceInput = Omit<ServiceOffering, "id">;

const EMPTY_SERVICE: ServiceInput = {
  name: "",
  description: "",
  price: 1000,
  priceModel: "unico",
  type: "site",
  minScore: 70,
};

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Serviço em edição; ausente ao cadastrar um novo. */
  service?: ServiceOffering;
  onSubmit: (input: ServiceInput) => Promise<void>;
}

export function ServiceDialog({
  open,
  onOpenChange,
  service,
  onSubmit,
}: ServiceDialogProps) {
  const [form, setForm] = React.useState<ServiceInput>(() =>
    service ? { ...service } : EMPTY_SERVICE
  );
  const [isSaving, setIsSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {service ? "Editar serviço" : "Novo serviço"}
          </DialogTitle>
          <DialogDescription>
            Os serviços cadastrados alimentam as recomendações e os valores das
            propostas.
          </DialogDescription>
        </DialogHeader>

        <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="service-name">Nome</Label>
            <Input
              id="service-name"
              value={form.name}
              placeholder="Ex.: Site Profissional"
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-description">Descrição</Label>
            <Textarea
              id="service-description"
              rows={3}
              value={form.description}
              placeholder="O que está incluído nesse serviço."
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-price">Preço (R$)</Label>
              <Input
                id="service-price"
                type="number"
                min={0}
                step={50}
                value={form.price}
                onChange={(event) =>
                  setForm({
                    ...form,
                    price: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-price-model">Cobrança</Label>
              <Select
                value={form.priceModel}
                onValueChange={(value) =>
                  setForm({ ...form, priceModel: value as PriceModel })
                }
              >
                <SelectTrigger id="service-price-model" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-type">Tipo de serviço</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm({ ...form, type: value as ServiceType })
                }
              >
                <SelectTrigger id="service-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="service-min-score">
                Score mínimo recomendado
              </Label>
              <span className="text-sm font-medium tabular-nums">
                {form.minScore}/{SCORE_MAX}
              </span>
            </div>
            <Slider
              id="service-min-score"
              min={0}
              max={SCORE_MAX}
              step={5}
              value={[form.minScore]}
              onValueChange={([value]) => setForm({ ...form, minScore: value })}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" form="service-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            {service ? "Salvar serviço" : "Cadastrar serviço"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
