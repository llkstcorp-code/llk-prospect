"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CATEGORIES } from "@/data/categories";
import { BRAZILIAN_STATES, RADIUS_OPTIONS } from "@/lib/constants";
import { SCORE_MAX } from "@/lib/score";
import { cn } from "@/lib/utils";
import { updateProspectingPreferences } from "@/services/settings";
import type { CategoryId, ProspectingPreferences } from "@/types";

interface ProspectingFormProps {
  preferences: ProspectingPreferences;
  onSaved: (preferences: ProspectingPreferences) => void;
}

export function ProspectingForm({
  preferences,
  onSaved,
}: ProspectingFormProps) {
  const { toast } = useToast();
  const [form, setForm] = React.useState(preferences);
  const [loadedPreferences, setLoadedPreferences] = React.useState(preferences);
  const [isSaving, setIsSaving] = React.useState(false);

  if (loadedPreferences !== preferences) {
    setLoadedPreferences(preferences);
    setForm(preferences);
  }

  function toggleCategory(id: CategoryId) {
    setForm((current) => ({
      ...current,
      favoriteCategories: current.favoriteCategories.includes(id)
        ? current.favoriteCategories.filter((item) => item !== id)
        : [...current.favoriteCategories, id],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      onSaved(await updateProspectingPreferences(form));
      toast({
        title: "Preferências salvas",
        description: "As próximas buscas já começam com esses valores.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Não foi possível salvar as preferências",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="[--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardTitle>Prospecção</CardTitle>
        <CardDescription>
          Valores padrão usados ao abrir uma nova busca de empresas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="default-city">Cidade padrão</Label>
              <Input
                id="default-city"
                value={form.defaultCity}
                onChange={(event) =>
                  setForm({ ...form, defaultCity: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default-state">Estado padrão</Label>
              <Select
                value={form.defaultState}
                onValueChange={(value) =>
                  setForm({ ...form, defaultState: value })
                }
              >
                <SelectTrigger id="default-state" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default-radius">Raio padrão</Label>
              <Select
                value={String(form.defaultRadiusKm)}
                onValueChange={(value) =>
                  setForm({ ...form, defaultRadiusKm: Number(value) })
                }
              >
                <SelectTrigger id="default-radius" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map((radius) => (
                    <SelectItem key={radius} value={String(radius)}>
                      {radius} km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label>Categorias favoritas</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isSelected = form.favoriteCategories.includes(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "h-7 rounded-full px-3 text-[0.8rem] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      isSelected
                        ? "bg-brand text-brand-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-sm space-y-2.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="default-score">Score mínimo</Label>
              <span className="text-sm font-medium tabular-nums">
                {form.minScore}/{SCORE_MAX}
              </span>
            </div>
            <Slider
              id="default-score"
              min={0}
              max={SCORE_MAX}
              step={5}
              value={[form.minScore]}
              onValueChange={([value]) => setForm({ ...form, minScore: value })}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : null}
              Salvar preferências
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
