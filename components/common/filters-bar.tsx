"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FiltersBarProps {
  /** Cada filho é um controle de filtro (select, input, etc.). */
  children: React.ReactNode;
  /** Quantidade de filtros diferentes do padrão, exibida no botão do mobile. */
  activeCount?: number;
  onClear?: () => void;
}

/**
 * Filtros inline no desktop e em drawer no mobile, sem duplicar os controles.
 */
export function FiltersBar({
  children,
  activeCount = 0,
  onClear,
}: FiltersBarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        {children}
        {onClear && activeCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Limpar
          </Button>
        ) : null}
      </div>

      <Button
        variant="outline"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <SlidersHorizontal data-icon="inline-start" />
        Filtros
        {activeCount > 0 ? (
          <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-brand text-[0.65rem] font-medium text-brand-foreground">
            {activeCount}
          </span>
        ) : null}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="max-h-[85svh] rounded-t-2xl">
          <SheetHeader className="px-0 pb-0">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 overflow-y-auto pb-2 [&_[data-slot=select-trigger]]:h-9 [&_[data-slot=select-trigger]]:w-full">
            {children}
          </div>
          <div className="flex gap-2">
            {onClear ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
              >
                Limpar
              </Button>
            ) : null}
            <Button className="flex-1" onClick={() => setIsOpen(false)}>
              Ver resultados
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
