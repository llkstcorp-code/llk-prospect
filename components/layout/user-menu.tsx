"use client";

import Link from "next/link";
import {
  ChevronsUpDown,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/store/theme-store";
import type { UserProfile } from "@/types";

const THEME_OPTIONS: Array<{
  value: Theme;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "claro", label: "Claro", icon: Sun },
  { value: "escuro", label: "Escuro", icon: Moon },
  { value: "sistema", label: "Do sistema", icon: Monitor },
];

interface UserMenuProps {
  user: UserProfile;
  /** Disparado ao navegar — usado para fechar o drawer no mobile. */
  onNavigate?: () => void;
}

export function UserMenu({ user, onNavigate }: UserMenuProps) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50">
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="rounded-lg bg-brand-surface text-xs font-medium text-brand">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {user.company} · {user.role}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracoes" onClick={onNavigate}>
            <UserRound />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes" onClick={onNavigate}>
            <Settings />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Tema
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          {THEME_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <option.icon className="size-4 text-muted-foreground" />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            toast({
              title: "Sessão encerrada",
              description:
                "A autenticação real será conectada em uma próxima etapa.",
            })
          }
        >
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
