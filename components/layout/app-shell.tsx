import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";

/** Estrutura comum a todas as telas autenticadas do produto. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh lg:pl-64">
      <Sidebar />
      <AppHeader />
      <main className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
