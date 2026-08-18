"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavItemActive, NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  /** Disparado ao navegar — usado para fechar o drawer no mobile. */
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = isNavItemActive(item, pathname);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
              isActive
                ? "bg-background font-medium text-foreground shadow-xs ring-1 ring-foreground/10"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive ? "text-brand" : "text-muted-foreground"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
