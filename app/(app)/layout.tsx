import { ToastProvider } from "@/components/common/toast";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LeadsProvider } from "@/store/leads-store";
import { ProfileProvider } from "@/store/profile-store";
import { ProspectingProvider } from "@/store/prospecting-store";

/**
 * Providers do painel. Ficam neste grupo de rotas (e não no layout raiz)
 * porque só as telas internas consomem esse estado — as demos públicas de
 * `/demo` não carregam nada disso.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ToastProvider>
      <TooltipProvider delayDuration={200}>
        <ProfileProvider>
          <ProspectingProvider>
            <LeadsProvider>
              <AppShell>{children}</AppShell>
            </LeadsProvider>
          </ProspectingProvider>
        </ProfileProvider>
      </TooltipProvider>
    </ToastProvider>
  );
}
