"use client";

import { Loader2, RotateCcw, Search } from "lucide-react";

import { SegmentedControl } from "@/components/common/segmented-control";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { CATEGORIES } from "@/data/categories";
import { BRAZILIAN_STATES, RADIUS_OPTIONS } from "@/lib/constants";
import { formatRating } from "@/lib/format";
import { SCORE_MAX } from "@/lib/score";
import type { CategoryId, PresenceFilter, SearchFilters } from "@/types";

const PRESENCE_OPTIONS: { value: PresenceFilter; label: string }[] = [
  { value: "qualquer", label: "Qualquer" },
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

interface SearchFiltersFormProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSubmit: () => void;
  onReset: () => void;
  isSearching: boolean;
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3.5">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function SearchFiltersForm({
  filters,
  onChange,
  onSubmit,
  onReset,
  isSearching,
}: SearchFiltersFormProps) {
  function update<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FieldGroup title="Localização">
        <div className="space-y-1.5">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={filters.city}
            placeholder="Ex.: Passos"
            onChange={(event) => update("city", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="state">Estado</Label>
            <Select
              value={filters.state}
              onValueChange={(value) => update("state", value)}
            >
              <SelectTrigger id="state" className="w-full">
                <SelectValue placeholder="UF" />
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
            <Label htmlFor="radius">Raio</Label>
            <Select
              value={String(filters.radiusKm)}
              onValueChange={(value) => update("radiusKm", Number(value))}
            >
              <SelectTrigger id="radius" className="w-full">
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
      </FieldGroup>

      <Separator />

      <FieldGroup title="Segmento">
        <div className="space-y-1.5">
          <Label htmlFor="category">Tipo de empresa</Label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              update("category", value as CategoryId | "todas")
            }
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os segmentos</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FieldGroup>

      <Separator />

      <FieldGroup title="Critérios">
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="min-rating">Nota mínima</Label>
            <span className="text-sm font-medium tabular-nums">
              {formatRating(filters.minRating)}
            </span>
          </div>
          <Slider
            id="min-rating"
            min={1}
            max={5}
            step={0.1}
            value={[filters.minRating]}
            onValueChange={([value]) => update("minRating", value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="min-reviews">Avaliações mínimas</Label>
          <Input
            id="min-reviews"
            type="number"
            min={0}
            step={10}
            value={filters.minReviews}
            onChange={(event) =>
              update("minReviews", Math.max(0, Number(event.target.value) || 0))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Possui site</Label>
          <SegmentedControl
            aria-label="Possui site"
            value={filters.hasWebsite}
            options={PRESENCE_OPTIONS}
            onChange={(value) => update("hasWebsite", value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Possui Instagram</Label>
          <SegmentedControl
            aria-label="Possui Instagram"
            value={filters.hasInstagram}
            options={PRESENCE_OPTIONS}
            onChange={(value) => update("hasInstagram", value)}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="min-score">Potencial mínimo</Label>
            <span className="text-sm font-medium tabular-nums">
              {filters.minScore}/{SCORE_MAX}
            </span>
          </div>
          <Slider
            id="min-score"
            min={0}
            max={SCORE_MAX}
            step={5}
            value={[filters.minScore]}
            onValueChange={([value]) => update("minScore", value)}
          />
        </div>
      </FieldGroup>

      <div className="space-y-2">
        <Button type="submit" size="lg" className="w-full" disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Search data-icon="inline-start" />
          )}
          {isSearching ? "Buscando..." : "Buscar empresas"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onReset}
          disabled={isSearching}
        >
          <RotateCcw data-icon="inline-start" />
          Limpar filtros
        </Button>
      </div>
    </form>
  );
}
