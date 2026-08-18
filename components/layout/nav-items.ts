import {
  Kanban,
  LayoutDashboard,
  Search,
  Settings,
  Target,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  /** Prefixo de rota que mantém o item ativo em páginas internas. */
  match: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: "/dashboard",
  },
  {
    href: "/empresas/buscar",
    label: "Encontrar empresas",
    icon: Search,
    match: "/empresas",
  },
  {
    href: "/oportunidades",
    label: "Oportunidades",
    icon: Target,
    match: "/oportunidades",
  },
  { href: "/leads", label: "Leads", icon: Users, match: "/leads" },
  { href: "/crm", label: "CRM", icon: Kanban, match: "/crm" },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings,
    match: "/configuracoes",
  },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}
