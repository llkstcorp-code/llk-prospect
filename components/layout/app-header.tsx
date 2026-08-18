"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProfile } from "@/store/profile-store";

/** Barra superior do mobile/tablet, com a navegação em drawer lateral. */
export function AppHeader() {
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-sm lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Abrir menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[17rem] gap-0 bg-sidebar p-0"
        >
          <SheetTitle className="sr-only">Navegação principal</SheetTitle>
          <div className="flex h-14 items-center px-5">
            <Brand />
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <SidebarNav onNavigate={() => setIsOpen(false)} />
          </div>
          <div className="border-t border-border p-2">
            <UserMenu user={profile} onNavigate={() => setIsOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Brand />
    </header>
  );
}
