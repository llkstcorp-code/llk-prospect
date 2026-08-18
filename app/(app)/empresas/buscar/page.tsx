"use client";

import * as React from "react";
import { SearchX, SlidersHorizontal, Telescope } from "lucide-react";

import { BusinessCard } from "@/components/business/business-card";
import { BusinessTable } from "@/components/business/business-table";
import { SearchFiltersForm } from "@/components/business/search-filters";
import { SearchProgress } from "@/components/business/search-progress";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DEFAULT_SEARCH_FILTERS, SORT_OPTIONS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { searchBusinesses, sortBusinesses } from "@/services/businesses";
import { getSettings } from "@/services/settings";
import { useProspecting } from "@/store/prospecting-store";
import type { Business, BusinessSort, SearchFilters } from "@/types";

export default function SearchBusinessesPage() {
  const { toast } = useToast();
  const { registerSearch } = useProspecting();
  const [defaults, setDefaults] = React.useState<SearchFilters>(
    DEFAULT_SEARCH_FILTERS
  );
  const [filters, setFilters] = React.useState<SearchFilters>(
    DEFAULT_SEARCH_FILTERS
  );
  const [results, setResults] = React.useState<Business[] | null>(null);
  const [provider, setProvider] = React.useState<
    "google" | "geoapify" | "mock" | null
  >(null);
  const [sort, setSort] = React.useState<BusinessSort>("oportunidade");
  const [isSearching, setIsSearching] = React.useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  // Os padrões definidos em Configurações abrem a busca já preenchida.
  React.useEffect(() => {
    let active = true;
    void getSettings().then(({ prospecting }) => {
      if (!active) return;
      const next: SearchFilters = {
        ...DEFAULT_SEARCH_FILTERS,
        city: prospecting.defaultCity,
        state: prospecting.defaultState,
        radiusKm: prospecting.defaultRadiusKm,
        minScore: prospecting.minScore,
      };
      setDefaults(next);
      setFilters(next);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSearch() {
    setIsFiltersOpen(false);
    setIsSearching(true);
    try {
      const result = await searchBusinesses(filters, sort);
      setResults(result.businesses);
      setProvider(result.provider ?? null);
      registerSearch(result.businesses);
      toast({
        title:
          result.total > 0
            ? `${formatNumber(result.total)} empresas encontradas`
            : "Nenhuma empresa encontrada",
        description:
          result.total > 0
            ? "Resultados ordenados por maior oportunidade."
            : "Tente ampliar o raio ou reduzir os critérios mínimos.",
        variant: result.total > 0 ? "success" : "info",
      });
    } catch {
      toast({
        title: "Não foi possível concluir a busca",
        description: "Tente novamente em alguns instantes.",
        variant: "error",
      });
    } finally {
      setIsSearching(false);
    }
  }

  function handleReset() {
    setFilters(defaults);
    setResults(null);
    setProvider(null);
  }

  function handleSortChange(value: BusinessSort) {
    setSort(value);
    setResults((current) => (current ? sortBusinesses(current, value) : current));
  }

  const filtersForm = (
    <SearchFiltersForm
      filters={filters}
      onChange={setFilters}
      onSubmit={() => void handleSearch()}
      onReset={handleReset}
      isSearching={isSearching}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encontrar empresas"
        description="Encontre empresas da sua região que podem precisar dos seus serviços."
        actions={
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setIsFiltersOpen(true)}
          >
            <SlidersHorizontal data-icon="inline-start" />
            Filtros
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[19rem_1fr] lg:gap-8">
        <aside className="hidden lg:sticky lg:top-10 lg:block">
          <Card className="[--card-spacing:--spacing(5)]">{filtersForm}</Card>
        </aside>

        <section className="min-w-0 space-y-4">
          {results && !isSearching ? (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {formatNumber(results.length)}{" "}
                  {results.length === 1
                    ? "empresa encontrada"
                    : "empresas encontradas"}
                </p>
                {provider === "geoapify" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Dados fornecidos por Geoapify. Avaliações não estão disponíveis.
                  </p>
                ) : null}
              </div>
              {results.length > 0 ? (
                <Select
                  value={sort}
                  onValueChange={(value) =>
                    handleSortChange(value as BusinessSort)
                  }
                >
                  <SelectTrigger size="sm" className="w-[13rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          ) : null}

          {isSearching ? (
            <Card className="p-0">
              <SearchProgress />
            </Card>
          ) : !results ? (
            <Card>
              <EmptyState
                icon={Telescope}
                title="Pronto para prospectar"
                description="Defina a cidade, o segmento e os critérios ao lado para encontrar empresas com potencial na sua região."
                action={
                  <Button
                    className="lg:hidden"
                    onClick={() => setIsFiltersOpen(true)}
                  >
                    <SlidersHorizontal data-icon="inline-start" />
                    Definir filtros
                  </Button>
                }
              />
            </Card>
          ) : results.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="Nenhuma empresa encontrada"
                description="Nenhum estabelecimento atende a todos os critérios definidos. Tente ampliar o raio, reduzir a nota mínima ou liberar o filtro de site."
                action={
                  <Button variant="outline" onClick={handleReset}>
                    Restaurar filtros padrão
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              <Card className="hidden p-0 lg:block">
                <BusinessTable businesses={results} />
              </Card>
              <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
                {results.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[88svh] gap-0 rounded-t-2xl p-0"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle>Filtros de busca</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto p-4">{filtersForm}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
